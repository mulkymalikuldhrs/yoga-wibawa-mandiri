/**
 * ============================================================
 * Voice Handler — Proses Input Suara untuk YWM Dashboard
 * ============================================================
 * 
 * Modul ini menangani:
 * - Rekam audio dari mikrofon (MediaRecorder API)
 * - Kirim ke puter.ai.speech2txt() untuk transkripsi
 * - Dukungan Bahasa Indonesia
 * - Route teks hasil transkripsi ke smart-input.js untuk parsing
 * - Visual feedback: indikator recording, waveform
 * - Maksimal durasi rekam: 60 detik
 * - Auto-proses setelah berhenti
 * 
 * Dependensi: ai-config.js (untuk VOICE_CONFIG, KV_KEYS)
 * 
 * @version 1.0.0
 * @author YWM Development Team
 */

(function() {
  'use strict';

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * State internal voice handler
   */
  const state = {
    isRecording: false,          // Sedang merekam atau tidak
    isProcessing: false,         // Sedang memproses transkripsi
    mediaRecorder: null,         // Instance MediaRecorder
    audioStream: null,           // MediaStream dari mikrofon
    audioChunks: [],             // Chunk audio yang direkam
    recordingStartTime: null,    // Waktu mulai rekam
    recordingDuration: 0,        // Durasi rekam dalam ms
    analyserNode: null,          // AnalyserNode untuk waveform
    animationFrame: null,        // requestAnimationFrame ID
    silenceTimer: null,          // Timer untuk auto-stop saat diam
    durationTimer: null,         // Timer untuk update durasi
    lastAudioBlob: null,         // Audio blob terakhir (jika autoProcess=false)
    callbacks: {                 // Callback functions
      onRecordingStart: null,
      onRecordingStop: null,
      onTranscriptionStart: null,
      onTranscriptionComplete: null,
      onTranscriptionError: null,
      onWaveformData: null,
      onDurationUpdate: null
    }
  };

  // ============================================================
  // KONFIGURASI
  // ============================================================

  /**
   * Mendapatkan konfigurasi voice dari ai-config.js
   * Fallback ke default jika config belum dimuat
   */
  function getConfig() {
    if (window.YWMAIConfig && window.YWMAIConfig.VOICE_CONFIG) {
      return window.YWMAIConfig.VOICE_CONFIG;
    }
    // Default config fallback
    return {
      language: 'id-ID',
      maxDurationMs: 60000,
      mimeType: 'audio/webm',
      fallbackMimeType: 'audio/mp4',
      visualFeedback: true,
      autoProcess: true,
      silenceThreshold: 2000
    };
  }

  function getKVKeys() {
    if (window.YWMAIConfig && window.YWMAIConfig.KV_KEYS) {
      return window.YWMAIConfig.KV_KEYS;
    }
    return { voiceTranscript: 'ywm_voice_' };
  }

  // ============================================================
  // PERIKSA DUKUNGAN BROWSER
  // ============================================================

  /**
   * Memeriksa apakah browser mendukung fitur voice input
   * @returns {Object} Status dukungan browser
   */
  function checkBrowserSupport() {
    const support = {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      audioContext: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
      puterSpeech2txt: typeof puter !== 'undefined' && typeof puter.ai !== 'undefined' && typeof puter.ai.speech2txt === 'function',
      webSpeech: typeof (window.SpeechRecognition || window.webkitSpeechRecognition) !== 'undefined',
      supported: false,
      mimeType: null
    };

    support.supported = support.mediaRecorder && support.getUserMedia;

    // Deteksi MIME type yang didukung browser
    if (support.mediaRecorder) {
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          support.mimeType = type;
          break;
        }
      }
    }

    return support;
  }

  // ============================================================
  // AUDIO CONTEXT & WAVEFORM VISUALIZATION
  // ============================================================

  /**
   * Membuat AudioContext dan AnalyserNode untuk visualisasi waveform
   * @param {MediaStream} stream - MediaStream dari mikrofon
   * @returns {AnalyserNode|null} AnalyserNode untuk waveform
   */
  function createAnalyser(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Hubungkan source ke analyser (jangan ke destination — tidak perlu playback)
      source.connect(analyser);
      
      return analyser;
    } catch (error) {
      console.warn('[Voice Handler] Gagal membuat analyser:', error.message);
      return null;
    }
  }

  /**
   * Membaca data waveform dari AnalyserNode
   * @param {AnalyserNode} analyser - AnalyserNode
   * @returns {Object} Data waveform dan level volume
   */
  function getWaveformData(analyser) {
    if (!analyser) return { waveformData: [], level: 0, isSilent: true };
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    
    // Hitung level volume RMS (Root Mean Square)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    const level = Math.sqrt(sum / bufferLength);
    
    // Konversi ke array normal untuk callback visualisasi
    const waveformData = Array.from(dataArray).map(v => (v - 128) / 128);
    
    return {
      waveformData,
      level,
      isSilent: level < 0.01 // Threshold deteksi diam
    };
  }

  /**
   * Memulai loop animasi untuk mengirim data waveform ke callback
   * Juga mendeteksi keheningan untuk auto-stop
   */
  function startWaveformAnimation() {
    if (!state.analyserNode) return;
    
    const config = getConfig();
    if (!config.visualFeedback) return;
    
    function animate() {
      if (!state.isRecording) return;
      
      const data = getWaveformData(state.analyserNode);
      
      // Kirim data waveform ke callback (untuk visualisasi UI)
      if (state.callbacks.onWaveformData) {
        state.callbacks.onWaveformData(data);
      }
      
      // Deteksi keheningan untuk auto-stop
      if (data.isSilent && config.silenceThreshold > 0) {
        if (!state.silenceTimer) {
          state.silenceTimer = setTimeout(() => {
            console.log('[Voice Handler] Auto-stop: diam terdeteksi selama', config.silenceThreshold, 'ms');
            stopRecording();
          }, config.silenceThreshold);
        }
      } else {
        // Reset timer jika ada suara terdeteksi
        if (state.silenceTimer) {
          clearTimeout(state.silenceTimer);
          state.silenceTimer = null;
        }
      }
      
      state.animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  }

  /**
   * Menghentikan animasi waveform
   */
  function stopWaveformAnimation() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    if (state.silenceTimer) {
      clearTimeout(state.silenceTimer);
      state.silenceTimer = null;
    }
  }

  // ============================================================
  // DURASI RECORDING
  // ============================================================

  /**
   * Memulai timer untuk melacak dan mengupdate durasi recording
   */
  function startDurationTimer() {
    state.recordingStartTime = Date.now();
    
    function tick() {
      if (!state.isRecording) return;
      
      state.recordingDuration = Date.now() - state.recordingStartTime;
      
      // Kirim update durasi ke callback
      if (state.callbacks.onDurationUpdate) {
        state.callbacks.onDurationUpdate(state.recordingDuration);
      }
      
      // Cek batas maksimal durasi
      const config = getConfig();
      if (state.recordingDuration >= config.maxDurationMs) {
        console.log('[Voice Handler] Auto-stop: batas durasi maksimal tercapai');
        stopRecording();
        return;
      }
      
      state.durationTimer = requestAnimationFrame(tick);
    }
    
    state.durationTimer = requestAnimationFrame(tick);
  }

  /**
   * Menghentikan timer durasi
   */
  function stopDurationTimer() {
    if (state.durationTimer) {
      cancelAnimationFrame(state.durationTimer);
      state.durationTimer = null;
    }
  }

  // ============================================================
  // RECORDING CONTROL
  // ============================================================

  /**
   * Memulai perekaman audio dari mikrofon
   * @returns {Promise<boolean>} true jika berhasil mulai rekam
   */
  async function startRecording() {
    // Cek apakah sedang merekam
    if (state.isRecording) {
      console.warn('[Voice Handler] Sudah merekam, abaikan permintaan');
      return false;
    }

    // Cek dukungan browser
    const support = checkBrowserSupport();
    if (!support.supported) {
      console.error('[Voice Handler] Browser tidak mendukung perekaman audio');
      if (state.callbacks.onTranscriptionError) {
        state.callbacks.onTranscriptionError({
          type: 'browser_not_supported',
          message: 'Browser Anda tidak mendukung perekaman audio. Gunakan Chrome atau Edge versi terbaru.'
        });
      }
      return false;
    }

    try {
      // Minta izin akses mikrofon
      const config = getConfig();
      state.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Tentukan MIME type yang didukung
      const mimeType = support.mimeType || config.fallbackMimeType || '';

      // Buat MediaRecorder instance
      const options = {};
      if (mimeType && MediaRecorder.isTypeSupported(mimeType)) {
        options.mimeType = mimeType;
      }
      state.mediaRecorder = new MediaRecorder(state.audioStream, options);
      state.audioChunks = [];

      // Event: data audio tersedia
      state.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          state.audioChunks.push(event.data);
        }
      };

      // Event: recording berhenti → proses audio
      state.mediaRecorder.onstop = async () => {
        await handleRecordingComplete();
      };

      // Event: error pada MediaRecorder
      state.mediaRecorder.onerror = (event) => {
        console.error('[Voice Handler] MediaRecorder error:', event.error);
        cleanupRecording();
        if (state.callbacks.onTranscriptionError) {
          state.callbacks.onTranscriptionError({
            type: 'recording_error',
            message: 'Terjadi kesalahan saat perekaman. Silakan coba lagi.'
          });
        }
      };

      // Mulai merekam — kirim chunk setiap 1 detik
      state.mediaRecorder.start(1000);
      state.isRecording = true;

      // Buat analyser untuk visualisasi waveform
      state.analyserNode = createAnalyser(state.audioStream);
      startWaveformAnimation();
      startDurationTimer();

      // Callback: recording dimulai
      if (state.callbacks.onRecordingStart) {
        state.callbacks.onRecordingStart();
      }

      console.log('[Voice Handler] Perekaman dimulai');
      return true;

    } catch (error) {
      console.error('[Voice Handler] Gagal memulai perekaman:', error);
      cleanupRecording();
      
      // Pesan error yang spesifik sesuai jenis error
      let errorType = 'mic_error';
      let errorMessage = 'Gagal mengakses mikrofon. Pastikan izin mikrofon diaktifkan.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'permission_denied';
        errorMessage = 'Izin mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser Anda.';
      } else if (error.name === 'NotFoundError') {
        errorType = 'mic_not_found';
        errorMessage = 'Mikrofon tidak ditemukan. Pastikan mikrofon terhubung ke perangkat Anda.';
      } else if (error.name === 'NotReadableError') {
        errorType = 'mic_busy';
        errorMessage = 'Mikrofon sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.';
      }

      if (state.callbacks.onTranscriptionError) {
        state.callbacks.onTranscriptionError({ type: errorType, message: errorMessage });
      }
      return false;
    }
  }

  /**
   * Menghentikan perekaman audio
   */
  async function stopRecording() {
    if (!state.isRecording || !state.mediaRecorder) {
      console.warn('[Voice Handler] Tidak sedang merekam');
      return;
    }

    try {
      // Hentikan animasi dan timer
      stopWaveformAnimation();
      stopDurationTimer();

      // Hitung durasi final
      if (state.recordingStartTime) {
        state.recordingDuration = Date.now() - state.recordingStartTime;
      }

      // Hentikan MediaRecorder
      if (state.mediaRecorder.state !== 'inactive') {
        state.mediaRecorder.stop();
      }

      state.isRecording = false;

      // Callback: recording berhenti
      if (state.callbacks.onRecordingStop) {
        state.callbacks.onRecordingStop({
          duration: state.recordingDuration,
          chunks: state.audioChunks.length
        });
      }

      console.log(`[Voice Handler] Perekaman berhenti (${formatDuration(state.recordingDuration)})`);

    } catch (error) {
      console.error('[Voice Handler] Gagal menghentikan perekaman:', error);
      cleanupRecording();
    }
  }

  /**
   * Membatalkan perekaman tanpa memproses hasilnya
   */
  function cancelRecording() {
    state.audioChunks = [];
    stopWaveformAnimation();
    stopDurationTimer();
    
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    
    state.isRecording = false;
    cleanupRecording();
    
    console.log('[Voice Handler] Perekaman dibatalkan');
  }

  // ============================================================
  // PROSES HASIL RECORDING
  // ============================================================

  /**
   * Menangani hasil perekaman yang selesai
   * Menggabungkan audio chunks menjadi satu Blob, lalu transkripsi
   */
  async function handleRecordingComplete() {
    const config = getConfig();

    // Gabungkan semua audio chunks menjadi satu Blob
    const mimeType = state.mediaRecorder?.mimeType || config.mimeType || 'audio/webm';
    const audioBlob = new Blob(state.audioChunks, { type: mimeType });

    // Validasi: audio terlalu pendek (kurang dari 0.5 detik)
    if (state.recordingDuration < 500) {
      console.warn('[Voice Handler] Audio terlalu pendek, abaikan');
      cleanupRecording();
      
      if (state.callbacks.onTranscriptionError) {
        state.callbacks.onTranscriptionError({
          type: 'too_short',
          message: 'Rekaman terlalu pendek. Tahan tombol rekam lebih lama.'
        });
      }
      return;
    }

    console.log(`[Voice Handler] Memproses audio: ${(audioBlob.size / 1024).toFixed(1)}KB, durasi ${formatDuration(state.recordingDuration)}`);

    // Auto-proses jika diaktifkan di konfigurasi
    if (config.autoProcess) {
      await transcribeAudio(audioBlob);
    } else {
      // Simpan blob untuk diproses nanti secara manual
      state.lastAudioBlob = audioBlob;
    }

    // Bersihkan resources
    cleanupRecording();
  }

  /**
   * Mengirim audio ke puter.ai.speech2txt() untuk transkripsi
   * @param {Blob} audioBlob - Audio blob yang akan ditranskripsi
   * @returns {Promise<string|null>} Teks hasil transkripsi
   */
  async function transcribeAudio(audioBlob) {
    if (!audioBlob) {
      console.error('[Voice Handler] Tidak ada audio untuk ditranskripsi');
      return null;
    }

    state.isProcessing = true;

    // Callback: transkripsi dimulai
    if (state.callbacks.onTranscriptionStart) {
      state.callbacks.onTranscriptionStart();
    }

    try {
      // Konversi Blob ke File (dibutuhkan oleh puter.ai.speech2txt)
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                         audioBlob.type.includes('ogg') ? 'ogg' : 'mp4';
      const audioFile = new File(
        [audioBlob], 
        `voice_recording_${Date.now()}.${extension}`, 
        { type: audioBlob.type }
      );

      // Kirim ke puter.ai.speech2txt()
      let transcript = null;

      if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function') {
        transcript = await puter.ai.speech2txt(audioFile);
        console.log('[Voice Handler] Hasil transkripsi:', transcript);
      } else {
        // Fallback: Web Speech API
        console.warn('[Voice Handler] puter.ai.speech2txt tidak tersedia, menggunakan Web Speech API fallback');
        transcript = await transcribeWithWebSpeech();
      }

      // Validasi hasil transkripsi
      if (!transcript || (typeof transcript === 'string' && transcript.trim().length === 0)) {
        throw new Error('Transkripsi kosong — tidak ada ucapan terdeteksi');
      }

      // Simpan transkripsi ke puter.kv
      await saveTranscript(typeof transcript === 'string' ? transcript : JSON.stringify(transcript));

      // Route ke smart-input untuk parsing jika tersedia
      const transcriptText = typeof transcript === 'string' ? transcript : transcript.text || '';
      
      if (window.YWMSmartInput && transcriptText) {
        try {
          const parsedResult = await window.YWMSmartInput.processInput(transcriptText);
          console.log('[Voice Handler] Hasil parsing smart input:', parsedResult);
        } catch (parseError) {
          console.warn('[Voice Handler] Gagal mem-parsing input via smart-input:', parseError.message);
        }
      }

      // Callback: transkripsi selesai
      if (state.callbacks.onTranscriptionComplete) {
        state.callbacks.onTranscriptionComplete({
          text: transcriptText,
          duration: state.recordingDuration,
          timestamp: new Date().toISOString()
        });
      }

      return transcriptText;

    } catch (error) {
      console.error('[Voice Handler] Gagal transkripsi:', error);

      // Error callback
      if (state.callbacks.onTranscriptionError) {
        const getErrMsg = window.YWMAIConfig?.getErrorMessage;
        const errorMessage = getErrMsg ? getErrMsg('generic') : 'Gagal mentranskripsi audio. Silakan coba lagi.';
        state.callbacks.onTranscriptionError({
          type: 'transcription_failed',
          message: errorMessage,
          originalError: error.message
        });
      }

      return null;

    } finally {
      state.isProcessing = false;
    }
  }

  /**
   * Fallback transkripsi menggunakan Web Speech API browser
   * Digunakan ketika puter.ai.speech2txt tidak tersedia
   * @returns {Promise<string|null>} Teks hasil transkripsi
   */
  function transcribeWithWebSpeech() {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API tidak tersedia di browser ini'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onerror = (event) => {
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      recognition.onend = () => {
        resolve(finalTranscript.trim() || null);
      };

      // Timeout 10 detik untuk fallback
      setTimeout(() => {
        recognition.stop();
      }, 10000);

      recognition.start();
    });
  }

  // ============================================================
  // PENYIMPANAN TRANSAKSI KE PUTER.KV
  // ============================================================

  /**
   * Menyimpan transkripsi ke puter.kv
   * @param {string} transcriptText - Teks transkripsi
   */
  async function saveTranscript(transcriptText) {
    try {
      const keys = getKVKeys();
      const timestamp = Date.now();
      const key = `${keys.voiceTranscript}${timestamp}`;

      const record = {
        text: transcriptText,
        timestamp: new Date().toISOString(),
        duration_ms: state.recordingDuration,
        processed: !!window.YWMSmartInput // Ditandai jika sudah diproses smart-input
      };

      // Simpan ke puter.kv
      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set(key, JSON.stringify(record));
        
        // Update index transkripsi untuk pencarian cepat
        const indexKey = `${keys.voiceTranscript}index`;
        let index = [];
        try {
          const existingIndex = await puter.kv.get(indexKey);
          if (existingIndex) {
            index = JSON.parse(existingIndex);
          }
        } catch (e) {
          // Index belum ada, buat baru
        }
        
        index.push({ 
          key, 
          timestamp: record.timestamp, 
          preview: transcriptText.substring(0, 50) 
        });
        
        // Simpan hanya 50 transkripsi terakhir di index
        if (index.length > 50) {
          index = index.slice(-50);
        }
        
        await puter.kv.set(indexKey, JSON.stringify(index));
        console.log('[Voice Handler] Transkripsi disimpan ke KV:', key);
      }
    } catch (error) {
      console.warn('[Voice Handler] Gagal menyimpan transkripsi ke KV:', error.message);
    }
  }

  /**
   * Mengambil riwayat transkripsi dari puter.kv
   * @param {number} limit - Jumlah transkripsi yang diambil
   * @returns {Promise<Array>} Daftar transkripsi terbaru
   */
  async function getTranscriptHistory(limit = 20) {
    try {
      const keys = getKVKeys();
      const indexKey = `${keys.voiceTranscript}index`;
      
      if (typeof puter === 'undefined' || !puter.kv) {
        return [];
      }

      const indexStr = await puter.kv.get(indexKey);
      if (!indexStr) return [];

      const index = JSON.parse(indexStr);
      const recent = index.slice(-limit);

      // Ambil detail setiap transkripsi dari KV
      const transcripts = [];
      for (const item of recent) {
        try {
          const dataStr = await puter.kv.get(item.key);
          if (dataStr) {
            transcripts.push(JSON.parse(dataStr));
          }
        } catch (e) {
          // Skip jika gagal baca satu item
        }
      }

      return transcripts.reverse(); // Terbaru di atas
    } catch (error) {
      console.warn('[Voice Handler] Gagal mengambil riwayat transkripsi:', error.message);
      return [];
    }
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Membersihkan semua resource setelah recording selesai
   */
  function cleanupRecording() {
    // Hentikan audio stream (bebaskan mikrofon)
    if (state.audioStream) {
      state.audioStream.getTracks().forEach(track => track.stop());
      state.audioStream = null;
    }

    // Hentikan animasi dan timer
    stopWaveformAnimation();
    stopDurationTimer();

    // Reset state
    state.mediaRecorder = null;
    state.audioChunks = [];
    state.analyserNode = null;
    state.recordingStartTime = null;
    state.recordingDuration = 0;
    state.silenceTimer = null;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Format durasi dari milidetik ke string mm:ss
   * @param {number} ms - Durasi dalam milidetik
   * @returns {string} Format mm:ss
   */
  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Kapitalisasi huruf pertama string
   * @param {string} str - Input string
   * @returns {string} String dengan huruf pertama kapital
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ============================================================
  // CALLBACK REGISTRATION
  // ============================================================

  /**
   * Mendaftarkan callback untuk event voice handler
   * @param {string} event - Nama event
   * @param {Function} callback - Fungsi callback
   */
  function on(event, callback) {
    const callbackKey = `on${capitalize(event)}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = callback;
    } else {
      console.warn(`[Voice Handler] Event tidak dikenal: ${event}`);
    }
  }

  /**
   * Menghapus callback untuk event tertentu
   * @param {string} event - Nama event
   */
  function off(event) {
    const callbackKey = `on${capitalize(event)}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = null;
    }
  }

  // ============================================================
  // PUBLIC API — Export ke window.YWMVoiceHandler
  // ============================================================

  const VoiceHandler = {
    /**
     * Mulai perekaman audio dari mikrofon
     * @returns {Promise<boolean>} Status berhasil/tidak
     */
    start: startRecording,

    /**
     * Hentikan perekaman dan otomatis proses transkripsi
     * @returns {Promise<void>}
     */
    stop: stopRecording,

    /**
     * Batalkan perekaman tanpa memproses hasilnya
     */
    cancel: cancelRecording,

    /**
     * Transkripsi audio blob yang sudah ada (bukan dari rekaman langsung)
     * @param {Blob} audioBlob - Audio blob untuk ditranskripsi
     * @returns {Promise<string|null>} Hasil transkripsi
     */
    transcribe: transcribeAudio,

    /**
     * Cek apakah sedang merekam
     * @returns {boolean}
     */
    isRecording: () => state.isRecording,

    /**
     * Cek apakah sedang memproses transkripsi
     * @returns {boolean}
     */
    isProcessing: () => state.isProcessing,

    /**
     * Dapatkan durasi recording saat ini dalam milidetik
     * @returns {number}
     */
    getDuration: () => state.recordingDuration,

    /**
     * Dapatkan riwayat transkripsi dari puter.kv
     * @param {number} limit - Batas jumlah transkripsi
     * @returns {Promise<Array>}
     */
    getHistory: getTranscriptHistory,

    /**
     * Daftarkan callback untuk event
     * Event yang tersedia:
     * - recordingStart: Saat perekaman dimulai
     * - recordingStop: Saat perekaman berhenti
     * - transcriptionStart: Saat transkripsi dimulai
     * - transcriptionComplete: Saat transkripsi selesai
     * - transcriptionError: Saat terjadi error
     * - waveformData: Data waveform untuk visualisasi (setiap frame)
     * - durationUpdate: Update durasi recording (setiap frame)
     * 
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on: on,

    /**
     * Hapus callback untuk event tertentu
     * @param {string} event - Event name
     */
    off: off,

    /**
     * Cek dukungan browser untuk voice input
     * @returns {Object} Info dukungan browser
     */
    checkSupport: checkBrowserSupport,

    /**
     * Format durasi ms ke string mm:ss
     * @param {number} ms - Durasi dalam milidetik
     * @returns {string} Format mm:ss
     */
    formatDuration: formatDuration,

    /**
     * Proses file audio dari upload (bukan dari rekaman mikrofon)
     * @param {File} audioFile - File audio dari input element
     * @returns {Promise<string|null>} Hasil transkripsi
     */
    processAudioFile: async function(audioFile) {
      if (!audioFile) return null;
      
      // Validasi tipe file
      const validTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a'];
      const isValidType = validTypes.some(t => audioFile.type === t) || 
                          audioFile.type.startsWith('audio/');
      if (!isValidType) {
        console.error('[Voice Handler] Tipe file tidak didukung:', audioFile.type);
        if (state.callbacks.onTranscriptionError) {
          state.callbacks.onTranscriptionError({
            type: 'invalid_format',
            message: 'Format file audio tidak didukung. Gunakan format WebM, MP4, OGG, WAV, atau M4A.'
          });
        }
        return null;
      }

      // Validasi ukuran file (maksimal 25MB)
      if (audioFile.size > 25 * 1024 * 1024) {
        console.error('[Voice Handler] File terlalu besar:', (audioFile.size / 1024 / 1024).toFixed(1), 'MB');
        if (state.callbacks.onTranscriptionError) {
          state.callbacks.onTranscriptionError({
            type: 'file_too_large',
            message: 'File audio terlalu besar. Maksimal 25MB.'
          });
        }
        return null;
      }

      state.isProcessing = true;
      if (state.callbacks.onTranscriptionStart) {
        state.callbacks.onTranscriptionStart();
      }

      try {
        let transcript = null;

        if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.speech2txt === 'function') {
          transcript = await puter.ai.speech2txt(audioFile);
        } else {
          console.error('[Voice Handler] puter.ai.speech2txt tidak tersedia');
          return null;
        }

        const transcriptText = typeof transcript === 'string' ? transcript : (transcript?.text || '');
        
        if (transcriptText.trim().length > 0) {
          // Simpan ke KV
          await saveTranscript(transcriptText);

          // Callback: transkripsi selesai
          if (state.callbacks.onTranscriptionComplete) {
            state.callbacks.onTranscriptionComplete({
              text: transcriptText,
              timestamp: new Date().toISOString(),
              source: 'file_upload'
            });
          }
          return transcriptText;
        }

        return null;
      } catch (error) {
        console.error('[Voice Handler] Gagal transkripsi file:', error);
        if (state.callbacks.onTranscriptionError) {
          state.callbacks.onTranscriptionError({
            type: 'transcription_failed',
            message: 'Gagal mentranskripsi file audio. Silakan coba lagi.',
            originalError: error.message
          });
        }
        return null;
      } finally {
        state.isProcessing = false;
      }
    }
  };

  // Export ke global scope
  window.YWMVoiceHandler = VoiceHandler;

  console.log('[Voice Handler] Modul voice handler dimuat ✓');

})();
