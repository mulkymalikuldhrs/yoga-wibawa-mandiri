/**
 * ============================================================
 * OCR Handler — Proses Dokumen OCR untuk YWM Dashboard
 * ============================================================
 * 
 * Modul ini menangani:
 * - Upload gambar/PDF → puter.ai.img2txt() → ekstrak teks
 * - Smart parsing: AI membaca invoice/receipt dan mengekstrak data
 *   (supplier, tanggal, item, jumlah, harga)
 * - Auto-save data terstruktur ke modul spare parts atau purchasing
 * - Klasifikasi dokumen: invoice, receipt, delivery note, report
 * - Simpan file asli di puter.fs under /ywm-documents/
 * - Simpan hasil OCR di puter.kv dengan key: ywm_ocr_{timestamp}
 * - Dukungan kamera untuk perangkat mobile
 * 
 * Dependensi: ai-config.js (untuk OCR_CONFIG, OCR_PARSE_PROMPT, KV_KEYS)
 * 
 * @version 1.0.0
 * @author YWM Development Team
 */

(function() {
  'use strict';

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  const state = {
    isProcessing: false,         // Sedang memproses OCR
    lastResult: null,            // Hasil OCR terakhir
    processingQueue: [],         // Antrian file untuk diproses
    isQueueRunning: false,       // Antrian sedang berjalan
    callbacks: {                 // Callback functions
      onProcessingStart: null,
      onOcrComplete: null,
      onParsingComplete: null,
      onAutoSaveComplete: null,
      onError: null,
      onProgress: null,
      onQueueUpdate: null
    }
  };

  // ============================================================
  // KONFIGURASI
  // ============================================================

  function getConfig() {
    if (window.YWMAIConfig && window.YWMAIConfig.OCR_CONFIG) {
      return window.YWMAIConfig.OCR_CONFIG;
    }
    return {
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      maxFileSizeMB: 10,
      storagePath: '/ywm-documents/',
      kvKeyPrefix: 'ywm_ocr_',
      autoSaveToModule: true,
      cameraSupport: true,
      classificationEnabled: true
    };
  }

  function getKVKeys() {
    if (window.YWMAIConfig && window.YWMAIConfig.KV_KEYS) {
      return window.YWMAIConfig.KV_KEYS;
    }
    return { ocrResult: 'ywm_ocr_' };
  }

  // ============================================================
  // VALIDASI INPUT
  // ============================================================

  /**
   * Memvalidasi file sebelum diproses OCR
   * @param {File} file - File yang akan divalidasi
   * @returns {Object} Hasil validasi { valid, error, errorType }
   */
  function validateFile(file) {
    const config = getConfig();

    // Cek apakah file ada
    if (!file) {
      return { valid: false, error: 'Tidak ada file yang dipilih', errorType: 'no_file' };
    }

    // Cek tipe file
    const isSupported = config.supportedFormats.some(fmt => {
      if (fmt === 'application/pdf') {
        return file.type === 'application/pdf';
      }
      return file.type.startsWith('image/');
    });

    if (!isSupported) {
      return { 
        valid: false, 
        error: `Format file tidak didukung (${file.type}). Gunakan JPG, PNG, WebP, atau PDF.`,
        errorType: 'invalid_format'
      };
    }

    // Cek ukuran file
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxFileSizeMB) {
      return { 
        valid: false, 
        error: `File terlalu besar (${fileSizeMB.toFixed(1)}MB). Maksimal ${config.maxFileSizeMB}MB.`,
        errorType: 'file_too_large'
      };
    }

    return { valid: true, error: null, errorType: null };
  }

  // ============================================================
  // PROSES OCR UTAMA
  // ============================================================

  /**
   * Memproses file gambar/PDF melalui OCR
   * @param {File} file - File gambar atau PDF
   * @param {Object} options - Opsi tambahan { autoParse, autoSave, classify }
   * @returns {Promise<Object>} Hasil OCR { text, parsed, classification, savedTo }
   */
  async function processDocument(file, options = {}) {
    const config = getConfig();
    const opts = {
      autoParse: options.autoParse !== undefined ? options.autoParse : true,
      autoSave: options.autoSave !== undefined ? options.autoSave : config.autoSaveToModule,
      classify: options.classify !== undefined ? options.classify : config.classificationEnabled,
      ...options
    };

    // Validasi file
    const validation = validateFile(file);
    if (!validation.valid) {
      if (state.callbacks.onError) {
        state.callbacks.onError({ type: validation.errorType, message: validation.error });
      }
      return null;
    }

    state.isProcessing = true;
    const result = {
      file: { name: file.name, type: file.type, size: file.size },
      text: null,
      parsed: null,
      classification: null,
      savedTo: null,
      kvKey: null,
      fsPath: null,
      timestamp: new Date().toISOString()
    };

    // Callback: proses dimulai
    if (state.callbacks.onProcessingStart) {
      state.callbacks.onProcessingStart({ file: file.name });
    }
    if (state.callbacks.onProgress) {
      state.callbacks.onProgress({ step: 'validating', percent: 10 });
    }

    try {
      // ========================================
      // LANGKAH 1: OCR — Ekstrak teks dari gambar
      // ========================================
      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'ocr_extracting', percent: 30 });
      }

      let extractedText = null;

      if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.img2txt === 'function') {
        extractedText = await puter.ai.img2txt(file);
        console.log('[OCR Handler] Teks berhasil diekstrak:', extractedText?.substring(0, 100) + '...');
      } else {
        throw new Error('puter.ai.img2txt tidak tersedia. Pastikan Puter.js sudah dimuat.');
      }

      result.text = extractedText;

      // Callback: OCR selesai
      if (state.callbacks.onOcrComplete) {
        state.callbacks.onOcrComplete({ text: extractedText });
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'ocr_complete', percent: 60 });
      }

      // ========================================
      // LANGKAH 2: Klasifikasi dokumen
      // ========================================
      if (opts.classify && extractedText) {
        result.classification = await classifyDocument(extractedText);
        console.log('[OCR Handler] Klasifikasi dokumen:', result.classification);
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'classifying', percent: 70 });
      }

      // ========================================
      // LANGKAH 3: Parsing data terstruktur
      // ========================================
      if (opts.autoParse && extractedText) {
        result.parsed = await parseDocument(extractedText, result.classification);
        console.log('[OCR Handler] Data terstruktur:', result.parsed);

        if (state.callbacks.onParsingComplete) {
          state.callbacks.onParsingComplete({ parsed: result.parsed });
        }
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'parsing', percent: 85 });
      }

      // ========================================
      // LANGKAH 4: Simpan file asli ke puter.fs
      // ========================================
      result.fsPath = await saveToFS(file);

      // ========================================
      // LANGKAH 5: Simpan hasil OCR ke puter.kv
      // ========================================
      result.kvKey = await saveToKV(result);

      // ========================================
      // LANGKAH 6: Auto-save ke modul terkait
      // ========================================
      if (opts.autoSave && result.parsed) {
        result.savedTo = await autoSaveToModule(result.parsed);
        
        if (state.callbacks.onAutoSaveComplete) {
          state.callbacks.onAutoSaveComplete({ savedTo: result.savedTo });
        }
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'complete', percent: 100 });
      }

      // Simpan hasil terakhir
      state.lastResult = result;

      console.log('[OCR Handler] Proses OCR selesai:', result.kvKey);
      return result;

    } catch (error) {
      console.error('[OCR Handler] Gagal memproses dokumen:', error);

      if (state.callbacks.onError) {
        const getErrMsg = window.YWMAIConfig?.getErrorMessage;
        const errorMessage = getErrMsg ? getErrMsg('generic') : 'Gagal memproses dokumen. Silakan coba lagi.';
        state.callbacks.onError({
          type: 'ocr_failed',
          message: errorMessage,
          originalError: error.message
        });
      }

      return null;

    } finally {
      state.isProcessing = false;
    }
  }

  // ============================================================
  // KLASIFIKASI DOKUMEN
  // ============================================================

  /**
   * Mengklasifikasikan jenis dokumen berdasarkan teks OCR
   * @param {string} text - Teks hasil OCR
   * @returns {Promise<Object>} Klasifikasi { type, confidence }
   */
  async function classifyDocument(text) {
    try {
      const model = window.YWMAIConfig ? window.YWMAIConfig.getOptimalModel('module_detection') : 'gpt-4o-mini';

      const prompt = `Klasifikasikan dokumen berikut berdasarkan isinya.

Pilih salah satu jenis:
- invoice: Faktur/tagihan dari supplier
- receipt: Kwitansi/tanda terima pembayaran
- delivery_note: Surat jalan/delivery note
- report: Laporan teknis/operasional
- purchase_order: Purchase order/perintah pembelian
- other: Dokumen lainnya

Teks dokumen:
${text.substring(0, 2000)}

Output dalam format JSON saja:
{
  "type": "invoice",
  "confidence": 0.9,
  "reason": "Mengandung daftar item dengan harga dan total"
}`;

      const response = await callAI(model, prompt);

      // Parse respons JSON
      try {
        const cleaned = extractJSON(response);
        return {
          type: cleaned.type || 'other',
          confidence: cleaned.confidence || 0.5,
          reason: cleaned.reason || ''
        };
      } catch (parseError) {
        // Fallback: deteksi sederhana berdasarkan kata kunci
        return simpleClassification(text);
      }

    } catch (error) {
      console.warn('[OCR Handler] Gagal mengklasifikasi dokumen:', error.message);
      return simpleClassification(text);
    }
  }

  /**
   * Klasifikasi sederhana berdasarkan kata kunci
   * Fallback jika AI klasifikasi gagal
   * @param {string} text - Teks hasil OCR
   * @returns {Object} Klasifikasi { type, confidence }
   */
  function simpleClassification(text) {
    const lower = text.toLowerCase();
    
    // Deteksi berdasarkan kata kunci
    if (lower.includes('invoice') || lower.includes('faktur') || lower.includes('tagihan')) {
      return { type: 'invoice', confidence: 0.7, reason: 'Mengandung kata kunci invoice/faktur' };
    }
    if (lower.includes('receipt') || lower.includes('kwitansi') || lower.includes('tanda terima')) {
      return { type: 'receipt', confidence: 0.7, reason: 'Mengandung kata kunci receipt/kwitansi' };
    }
    if (lower.includes('surat jalan') || lower.includes('delivery note') || lower.includes('pengiriman')) {
      return { type: 'delivery_note', confidence: 0.7, reason: 'Mengandung kata kunci surat jalan' };
    }
    if (lower.includes('purchase order') || lower.includes('perintah pembelian') || lower.includes('po-')) {
      return { type: 'purchase_order', confidence: 0.7, reason: 'Mengandung kata kunci purchase order' };
    }
    if (lower.includes('laporan') || lower.includes('report') || lower.includes('hasil')) {
      return { type: 'report', confidence: 0.6, reason: 'Mengandung kata kunci laporan' };
    }
    
    return { type: 'other', confidence: 0.3, reason: 'Tidak dikenali' };
  }

  // ============================================================
  // PARSING DOKUMEN
  // ============================================================

  /**
   * Parsing teks OCR menjadi data terstruktur
   * @param {string} text - Teks hasil OCR
   * @param {Object} classification - Hasil klasifikasi dokumen
   * @returns {Promise<Object>} Data terstruktur dari dokumen
   */
  async function parseDocument(text, classification) {
    try {
      const config = getConfig();
      const model = window.YWMAIConfig ? window.YWMAIConfig.getOptimalModel('ocr_parsing') : 'gemini-2.5-flash';
      
      // Gunakan prompt parsing dari ai-config
      const parsePrompt = window.YWMAIConfig ? window.YWMAIConfig.OCR_PARSE_PROMPT : '';

      const prompt = `${parsePrompt}

Jenis dokumen terdeteksi: ${classification?.type || 'unknown'}

Teks OCR yang perlu di-parse:
${text.substring(0, 4000)}

Ingat: Output HANYA dalam format JSON, tanpa penjelasan tambahan.`;

      const response = await callAI(model, prompt);

      // Parse respons JSON
      try {
        const parsed = extractJSON(response);
        return parsed;
      } catch (parseError) {
        console.warn('[OCR Handler] Gagal parse respons AI sebagai JSON:', parseError.message);
        // Return data dasar
        return {
          jenis_dokumen: classification?.type || 'unknown',
          teks_mentah: text.substring(0, 1000),
          parse_error: true
        };
      }

    } catch (error) {
      console.error('[OCR Handler] Gagal mem-parsing dokumen:', error);
      return {
        jenis_dokumen: classification?.type || 'unknown',
        teks_mentah: text.substring(0, 1000),
        parse_error: true,
        error: error.message
      };
    }
  }

  // ============================================================
  // PENYIMPANAN
  // ============================================================

  /**
   * Menyimpan file asli ke puter.fs
   * @param {File} file - File yang disimpan
   * @returns {Promise<string|null>} Path di puter.fs
   */
  async function saveToFS(file) {
    try {
      const config = getConfig();
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const dirPath = config.storagePath;

      // Pastikan direktori ada
      if (typeof puter !== 'undefined' && puter.fs) {
        try {
          await puter.fs.mkdir(dirPath);
        } catch (e) {
          // Direktori mungkin sudah ada, abaikan error
        }

        // Upload file
        await puter.fs.write(`${dirPath}${fileName}`, file);
        console.log('[OCR Handler] File disimpan di puter.fs:', `${dirPath}${fileName}`);
        return `${dirPath}${fileName}`;
      }

      return null;
    } catch (error) {
      console.warn('[OCR Handler] Gagal menyimpan file ke puter.fs:', error.message);
      return null;
    }
  }

  /**
   * Menyimpan hasil OCR ke puter.kv
   * @param {Object} result - Hasil OCR lengkap
   * @returns {Promise<string|null>} Key di puter.kv
   */
  async function saveToKV(result) {
    try {
      const keys = getKVKeys();
      const timestamp = Date.now();
      const key = `${keys.ocrResult}${timestamp}`;

      const record = {
        text: result.text,
        classification: result.classification,
        parsed: result.parsed,
        file: result.file,
        fsPath: result.fsPath,
        timestamp: result.timestamp,
        savedTo: result.savedTo
      };

      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set(key, JSON.stringify(record));
        
        // Update index OCR
        const indexKey = `${keys.ocrResult}index`;
        let index = [];
        try {
          const existingIndex = await puter.kv.get(indexKey);
          if (existingIndex) {
            index = JSON.parse(existingIndex);
          }
        } catch (e) {
          // Index belum ada
        }
        
        index.push({
          key,
          timestamp: result.timestamp,
          fileName: result.file?.name,
          type: result.classification?.type || 'unknown'
        });
        
        // Simpan hanya 50 record terakhir di index
        if (index.length > 50) {
          index = index.slice(-50);
        }
        
        await puter.kv.set(indexKey, JSON.stringify(index));
        console.log('[OCR Handler] Hasil OCR disimpan di KV:', key);
        return key;
      }

      return null;
    } catch (error) {
      console.warn('[OCR Handler] Gagal menyimpan hasil OCR ke KV:', error.message);
      return null;
    }
  }

  /**
   * Menyimpan data terstruktur ke modul yang sesuai
   * @param {Object} parsedData - Data terstruktur dari parsing
   * @returns {Promise<Object|null>} Info modul yang menerima data
   */
  async function autoSaveToModule(parsedData) {
    try {
      if (!parsedData || parsedData.parse_error) {
        console.warn('[OCR Handler] Data tidak valid untuk auto-save');
        return null;
      }

      const docType = parsedData.jenis_dokumen;
      let targetModule = null;
      let saveResult = null;

      // Tentukan modul target berdasarkan jenis dokumen
      switch (docType) {
        case 'invoice':
        case 'purchase_order':
          // Invoice dan PO → modul purchasing
          targetModule = 'purchasing';
          break;
        case 'receipt':
          // Kwitansi → modul keuangan
          targetModule = 'keuangan';
          break;
        case 'delivery_note':
          // Surat jalan → modul spare-parts (barang masuk)
          targetModule = 'spare-parts';
          break;
        default:
          // Dokumen lain → simpan sebagai referensi umum
          targetModule = null;
      }

      if (targetModule && window.YWMSmartInput) {
        // Gunakan smart-input untuk menyimpan ke modul
        const moduleData = convertToModuleData(parsedData, targetModule);
        saveResult = await window.YWMSmartInput.saveToModule(targetModule, moduleData);
        console.log(`[OCR Handler] Data auto-save ke modul ${targetModule}:`, saveResult);
      }

      return {
        module: targetModule,
        result: saveResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.warn('[OCR Handler] Gagal auto-save ke modul:', error.message);
      return null;
    }
  }

  /**
   * Konversi data parsed OCR ke format data modul
   * @param {Object} parsedData - Data hasil parsing OCR
   * @param {string} targetModule - Modul target
   * @returns {Object} Data dalam format modul target
   */
  function convertToModuleData(parsedData, targetModule) {
    const baseData = {
      sumber: 'ocr',
      timestamp: new Date().toISOString(),
      nomor_referensi: parsedData.nomor_referensi || null
    };

    switch (targetModule) {
      case 'purchasing':
        return {
          ...baseData,
          module: 'purchasing',
          action: 'buat_po',
          data: {
            supplier: parsedData.supplier || null,
            items: (parsedData.items || []).map(item => ({
              nama: item.nama,
              jumlah: item.jumlah,
              satuan: item.satuan,
              harga_satuan: item.harga_satuan,
              total: item.total
            })),
            total_keseluruhan: parsedData.total_keseluruhan || 0,
            tanggal: parsedData.tanggal || new Date().toISOString().split('T')[0],
            status: 'dibuat'
          }
        };

      case 'keuangan':
        return {
          ...baseData,
          module: 'keuangan',
          action: 'input',
          data: {
            tipe: 'pengeluaran',
            kategori: 'pembelian',
            jumlah: parsedData.total_keseluruhan || 0,
            keterangan: `Pembayaran ${parsedData.jenis_dokumen} - ${parsedData.supplier || 'Unknown'}`,
            referensi: parsedData.nomor_referensi,
            status: 'lunas'
          }
        };

      case 'spare-parts':
        return {
          ...baseData,
          module: 'spare-parts',
          action: 'masuk',
          data: {
            tipe_transaksi: 'masuk',
            items: (parsedData.items || []).map(item => ({
              nama_part: item.nama,
              jumlah: item.jumlah,
              satuan: item.satuan || 'pcs'
            })),
            supplier: parsedData.supplier || null,
            referensi: parsedData.nomor_referensi,
            tanggal: parsedData.tanggal || new Date().toISOString().split('T')[0]
          }
        };

      default:
        return {
          ...baseData,
          module: targetModule,
          data: parsedData
        };
    }
  }

  // ============================================================
  // ANTRIAN PEMROSESAN (QUEUE)
  // ============================================================

  /**
   * Menambah file ke antrian pemrosesan OCR
   * Berguna jika user upload banyak file sekaligus
   * @param {File} file - File yang akan diproses
   * @param {Object} options - Opsi pemrosesan
   * @returns {number} Posisi dalam antrian (1-based)
   */
  function addToQueue(file, options = {}) {
    const queueItem = {
      id: Date.now() + Math.random(),
      file,
      options,
      status: 'pending',  // pending, processing, completed, failed
      result: null,
      error: null
    };

    state.processingQueue.push(queueItem);

    // Callback: antrian diupdate
    if (state.callbacks.onQueueUpdate) {
      state.callbacks.onQueueUpdate(getQueueStatus());
    }

    // Mulai proses antrian jika belum berjalan
    if (!state.isQueueRunning) {
      processQueue();
    }

    return state.processingQueue.length;
  }

  /**
   * Memproses antrian file satu per satu
   */
  async function processQueue() {
    if (state.isQueueRunning) return;
    state.isQueueRunning = true;

    while (state.processingQueue.length > 0) {
      const item = state.processingQueue.find(i => i.status === 'pending');
      if (!item) break;

      item.status = 'processing';
      
      if (state.callbacks.onQueueUpdate) {
        state.callbacks.onQueueUpdate(getQueueStatus());
      }

      try {
        item.result = await processDocument(item.file, item.options);
        item.status = 'completed';
      } catch (error) {
        item.error = error.message;
        item.status = 'failed';
      }

      if (state.callbacks.onQueueUpdate) {
        state.callbacks.onQueueUpdate(getQueueStatus());
      }
    }

    state.isQueueRunning = false;
  }

  /**
   * Mendapatkan status antrian saat ini
   * @returns {Object} Status antrian
   */
  function getQueueStatus() {
    const total = state.processingQueue.length;
    const completed = state.processingQueue.filter(i => i.status === 'completed').length;
    const failed = state.processingQueue.filter(i => i.status === 'failed').length;
    const pending = state.processingQueue.filter(i => i.status === 'pending').length;
    const processing = state.processingQueue.filter(i => i.status === 'processing').length;

    return {
      total,
      completed,
      failed,
      pending,
      processing,
      progress: total > 0 ? ((completed + failed) / total * 100).toFixed(0) : 0
    };
  }

  /**
   * Mengosongkan antrian pemrosesan
   */
  function clearQueue() {
    state.processingQueue = [];
    state.isQueueRunning = false;
    
    if (state.callbacks.onQueueUpdate) {
      state.callbacks.onQueueUpdate(getQueueStatus());
    }
  }

  // ============================================================
  // KAMERA (MOBILE SUPPORT)
  // ============================================================

  /**
   * Membuka kamera untuk menangkap gambar dokumen
   * @returns {Promise<File|null>} File gambar dari kamera
   */
  function captureFromCamera() {
    return new Promise((resolve, reject) => {
      // Buat input file tersembunyi dengan atribut kamera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Gunakan kamera belakang
      
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          resolve(file);
        } else {
          resolve(null);
        }
        // Bersihkan elemen input
        document.body.removeChild(input);
      };

      input.oncancel = () => {
        resolve(null);
        document.body.removeChild(input);
      };

      // Tambahkan ke DOM dan klik
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Membuka file picker untuk memilih dokumen
   * @param {Object} options - Opsi { multiple, accept }
   * @returns {Promise<File|File[]|null>} File yang dipilih
   */
  function pickDocument(options = {}) {
    return new Promise((resolve, reject) => {
      const config = getConfig();
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.accept || config.supportedFormats.join(',');
      input.multiple = !!options.multiple;
      
      input.onchange = async (event) => {
        const files = Array.from(event.target.files);
        if (options.multiple) {
          resolve(files.length > 0 ? files : null);
        } else {
          resolve(files.length > 0 ? files[0] : null);
        }
        document.body.removeChild(input);
      };

      input.oncancel = () => {
        resolve(null);
        document.body.removeChild(input);
      };

      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
    });
  }

  // ============================================================
  // RIWAYAT OCR
  // ============================================================

  /**
   * Mengambil riwayat OCR dari puter.kv
   * @param {number} limit - Jumlah record
   * @returns {Promise<Array>} Daftar hasil OCR
   */
  async function getOCRHHistory(limit = 20) {
    try {
      const keys = getKVKeys();
      const indexKey = `${keys.ocrResult}index`;
      
      if (typeof puter === 'undefined' || !puter.kv) {
        return [];
      }

      const indexStr = await puter.kv.get(indexKey);
      if (!indexStr) return [];

      const index = JSON.parse(indexStr);
      const recent = index.slice(-limit);

      const results = [];
      for (const item of recent) {
        try {
          const dataStr = await puter.kv.get(item.key);
          if (dataStr) {
            results.push(JSON.parse(dataStr));
          }
        } catch (e) {
          // Skip jika gagal baca
        }
      }

      return results.reverse();
    } catch (error) {
      console.warn('[OCR Handler] Gagal mengambil riwayat OCR:', error.message);
      return [];
    }
  }

  // ============================================================
  // UTILITY — AI CALL & JSON PARSING
  // ============================================================

  /**
   * Memanggil AI dengan fallback strategy
   * @param {string} model - Model ID
   * @param {string} prompt - Prompt untuk AI
   * @returns {Promise<string>} Respons AI
   */
  async function callAI(model, prompt) {
    if (typeof puter === 'undefined' || !puter.ai) {
      throw new Error('puter.ai tidak tersedia');
    }

    // Gunakan callWithFallback dari ai-config jika tersedia
    if (window.YWMAIConfig && window.YWMAIConfig.callWithFallback) {
      return await window.YWMAIConfig.callWithFallback(
        (m) => puter.ai.chat(prompt, { model: m }),
        model
      );
    }

    // Fallback langsung
    const response = await puter.ai.chat(prompt, { model });
    return typeof response === 'string' ? response : response?.message?.content || response?.toString() || '';
  }

  /**
   * Mengekstrak JSON dari respons AI yang mungkin mengandung markdown code blocks
   * @param {string} response - Respons AI
   * @returns {Object} Parsed JSON object
   */
  function extractJSON(response) {
    if (!response) throw new Error('Respons kosong');
    
    // Jika response sudah berupa object
    if (typeof response === 'object') return response;

    let text = typeof response === 'string' ? response : response.toString();

    // Coba parse langsung
    try {
      return JSON.parse(text);
    } catch (e) {
      // Lanjut ke metode lain
    }

    // Coba ekstrak dari code block markdown ```json ... ```
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim());
      } catch (e) {
        // Lanjut
      }
    }

    // Coba cari object JSON dalam teks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Lanjut
      }
    }

    throw new Error('Tidak dapat mengekstrak JSON dari respons AI');
  }

  // ============================================================
  // CALLBACK REGISTRATION
  // ============================================================

  /**
   * Mendaftarkan callback untuk event OCR handler
   * @param {string} event - Nama event
   * @param {Function} callback - Fungsi callback
   */
  function on(event, callback) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = callback;
    } else {
      console.warn(`[OCR Handler] Event tidak dikenal: ${event}`);
    }
  }

  /**
   * Menghapus callback untuk event tertentu
   * @param {string} event - Nama event
   */
  function off(event) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = null;
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  const OCRHandler = {
    /**
     * Proses dokumen (gambar/PDF) melalui OCR
     * @param {File} file - File gambar atau PDF
     * @param {Object} options - Opsi: { autoParse, autoSave, classify }
     * @returns {Promise<Object|null>} Hasil OCR lengkap
     */
    process: processDocument,

    /**
     * Tambah file ke antrian pemrosesan
     * @param {File} file - File untuk diproses
     * @param {Object} options - Opsi pemrosesan
     * @returns {number} Posisi antrian
     */
    addToQueue: addToQueue,

    /**
     * Kosongkan antrian pemrosesan
     */
    clearQueue: clearQueue,

    /**
     * Dapatkan status antrian
     * @returns {Object} Status antrian
     */
    getQueueStatus: getQueueStatus,

    /**
     * Tangkap gambar dari kamera (mobile)
     * @returns {Promise<File|null>}
     */
    captureFromCamera: captureFromCamera,

    /**
     * Pilih dokumen dari file picker
     * @param {Object} options - { multiple, accept }
     * @returns {Promise<File|File[]|null>}
     */
    pickDocument: pickDocument,

    /**
     * Ambil riwayat OCR dari puter.kv
     * @param {number} limit - Batas jumlah
     * @returns {Promise<Array>}
     */
    getHistory: getOCRHHistory,

    /**
     * Cek apakah sedang memproses
     * @returns {boolean}
     */
    isProcessing: () => state.isProcessing,

    /**
     * Dapatkan hasil OCR terakhir
     * @returns {Object|null}
     */
    getLastResult: () => state.lastResult,

    /**
     * Validasi file sebelum diproses
     * @param {File} file - File untuk divalidasi
     * @returns {Object} Hasil validasi
     */
    validate: validateFile,

    /**
     * Daftarkan callback
     * Event: processing_start, ocr_complete, parsing_complete, auto_save_complete, error, progress, queue_update
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on: on,

    /**
     * Hapus callback
     * @param {string} event - Event name
     */
    off: off
  };

  // Export ke global scope
  window.YWMOCRHandler = OCRHandler;

  console.log('[OCR Handler] Modul OCR handler dimuat ✓');

})();
