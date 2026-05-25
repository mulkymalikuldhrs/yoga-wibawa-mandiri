/**
 * ============================================================
 * AI Assistant — Chat Interface untuk YWM Dashboard
 * ============================================================
 * 
 * Modul ini menyediakan:
 * - Chat interface dengan riwayat pesan tersimpan di puter.kv
 * - Streaming responses dengan puter.ai.chat({stream: true})
 * - Voice input: rekam audio → puter.ai.speech2txt → proses
 * - Smart data input: bahasa natural → AI parse → auto-save ke modul
 * - Quick actions: prompt predefined untuk tugas umum
 * - Context awareness: system prompt tahu detail perusahaan YWM
 * - Model selector: gpt-4o-mini (default), claude-3.5-sonnet, 
 *   gemini-2.5-flash, deepseek-chat
 * - Riwayat chat persisten di puter.kv dengan key: ywm_chat_history
 * 
 * Dependensi: ai-config.js, smart-input.js, voice-handler.js, 
 *             ocr-handler.js, report-generator.js
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
    // Chat state
    messages: [],              // Daftar pesan dalam sesi saat ini
    isStreaming: false,        // Sedang streaming respons
    isTyping: false,           // AI sedang "mengetik"
    currentStreamText: '',     // Teks yang sedang di-stream
    selectedModel: 'gpt-4o-mini', // Model AI yang dipilih
    
    // UI state
    isOpen: false,             // Panel chat terbuka/tertutup
    isMinimized: false,        // Panel chat diminimalkan
    isListening: false,        // Sedang merekam suara
    showModelSelector: false,  // Tampilkan selector model
    showQuickActions: true,    // Tampilkan quick action buttons
    
    // Context
    activeModule: null,        // Modul dashboard yang sedang aktif
    sessionStartTime: null,    // Waktu mulai sesi
    
    // Callbacks
    callbacks: {
      onMessageSent: null,
      onMessageReceived: null,
      onStreamingUpdate: null,
      onStreamComplete: null,
      onError: null,
      onStateChanged: null,
      onVoiceStart: null,
      onVoiceStop: null,
      onSmartInputProcessed: null
    }
  };

  // ============================================================
  // KONFIGURASI
  // ============================================================

  function getChatConfig() {
    if (window.YWMAIConfig && window.YWMAIConfig.CHAT_CONFIG) {
      return window.YWMAIConfig.CHAT_CONFIG;
    }
    return {
      historyKey: 'ywm_chat_history',
      maxHistoryMessages: 100,
      streamingEnabled: true,
      defaultModel: 'gpt-4o-mini',
      systemPrompt: 'Kamu adalah AI Assistant untuk PT Yoga Wibawa Mandiri.',
      quickActions: []
    };
  }

  function getSystemPrompt() {
    const config = getChatConfig();
    if (window.YWMAIConfig && window.YWMAIConfig.YWM_SYSTEM_PROMPT) {
      return window.YWMAIConfig.YWM_SYSTEM_PROMPT;
    }
    return config.systemPrompt;
  }

  // ============================================================
  // MENGIRIM PESAN
  // ============================================================

  /**
   * Mengirim pesan user dan mendapatkan respons AI
   * @param {string} text - Teks pesan dari user
   * @param {Object} options - Opsi { skipSmartInput, forceModule }
   * @returns {Promise<Object|null>} Pesan respons AI
   */
  async function sendMessage(text, options = {}) {
    if (!text || text.trim().length === 0) return null;

    const config = getChatConfig();
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Tambahkan ke daftar pesan
    state.messages.push(userMessage);

    // Callback: pesan dikirim
    if (state.callbacks.onMessageSent) {
      state.callbacks.onMessageSent(userMessage);
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    // ========================================
    // Cek apakah input adalah perintah smart input
    // ========================================
    if (!options.skipSmartInput && window.YWMSmartInput) {
      const smartInputDetected = await trySmartInput(text, options.forceModule);
      if (smartInputDetected) {
        // Input sudah diproses oleh smart input
        return smartInputDetected;
      }
    }

    // ========================================
    // Kirim ke AI untuk respons chat
    // ========================================
    state.isTyping = true;
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    try {
      // Siapkan messages untuk dikirim ke AI
      const chatMessages = buildChatMessages(text);

      if (config.streamingEnabled) {
        // Streaming response
        const assistantMessage = await streamResponse(chatMessages);
        return assistantMessage;
      } else {
        // Non-streaming response
        const assistantMessage = await getFullResponse(chatMessages);
        return assistantMessage;
      }

    } catch (error) {
      console.error('[AI Assistant] Gagal mendapatkan respons:', error);
      
      // Tambahkan pesan error
      const errorMessage = {
        id: generateId(),
        role: 'assistant',
        content: getErrorMessage(error),
        timestamp: new Date().toISOString(),
        isError: true
      };
      state.messages.push(errorMessage);

      if (state.callbacks.onError) {
        state.callbacks.onError({
          type: 'ai_response_failed',
          message: getErrorMessage(error),
          originalError: error.message
        });
      }

      return errorMessage;

    } finally {
      state.isTyping = false;
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }
    }
  }

  /**
   * Mencoba memproses input melalui smart input
   * Mengembalikan respons jika input terdeteksi sebagai data modul
   * @param {string} text - Teks input
   * @param {string} forceModule - Modul yang dipaksa (opsional)
   * @returns {Promise<Object|null>} Respons smart input atau null
   */
  async function trySmartInput(text, forceModule = null) {
    if (!window.YWMSmartInput) return null;

    // Deteksi apakah input kemungkinan besar adalah input data
    const dataKeywords = [
      'masuk', 'keluar', 'stok', 'order', 'produksi', 'shift',
      'maintenance', 'jadwal', 'insiden', 'bayar', 'cuti',
      'bearing', 'belt', 'seal', 'zak', 'tonase', 'downtime',
      'supplier', 'gudang', 'wo-', 'po-', 'tim', 'kegiatan'
    ];

    const lowerText = text.toLowerCase();
    const isLikelyDataInput = dataKeywords.some(kw => lowerText.includes(kw));

    if (!isLikelyDataInput && !forceModule) {
      return null; // Bukan input data, lanjutkan ke chat biasa
    }

    try {
      const result = await window.YWMSmartInput.processInput(text, forceModule);

      if (result) {
        // Buat respons konfirmasi
        const moduleLabels = {
          'spare-parts': '📦 Spare Parts',
          'team': '👥 Kegiatan Tim',
          'maintenance': '🔧 Maintenance',
          'produksi': '📊 Produksi',
          'keuangan': '💰 Keuangan',
          'hse': '⚠️ HSE',
          'hr': '🧑‍💼 HR',
          'purchasing': '🛒 Purchasing',
          'distribusi': '🚛 Distribusi'
        };

        const moduleLabel = moduleLabels[result.module] || result.module;
        const actionLabels = {
          'masuk': 'Barang Masuk',
          'keluar': 'Barang Keluar',
          'order': 'Pemesanan',
          'log': 'Pencatatan',
          'jadwal': 'Penjadwalan',
          'buat_wo': 'Pembuatan WO',
          'update_wo': 'Update WO',
          'input': 'Input Data',
          'lapor': 'Pelaporan',
          'inspeksi': 'Inspeksi',
          'cuti': 'Pengajuan Cuti',
          'karyawan_baru': 'Karyawan Baru',
          'buat_po': 'Pembuatan PO',
          'terima': 'Penerimaan',
          'dispatch': 'Pengiriman'
        };

        const actionLabel = actionLabels[result.action] || result.action;

        const confirmMessage = {
          id: generateId(),
          role: 'assistant',
          content: `✅ **Data berhasil disimpan!**\n\n**Modul:** ${moduleLabel}\n**Aksi:** ${actionLabel}\n**Data:**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n\nData telah tersimpan di modul ${moduleLabel}. Anda bisa melihat data tersebut di halaman modul yang bersangkutan.`,
          timestamp: new Date().toISOString(),
          isSmartInput: true,
          smartInputResult: result
        };

        state.messages.push(confirmMessage);

        if (state.callbacks.onSmartInputProcessed) {
          state.callbacks.onSmartInputProcessed(result);
        }
        if (state.callbacks.onMessageReceived) {
          state.callbacks.onMessageReceived(confirmMessage);
        }
        if (state.callbacks.onStateChanged) {
          state.callbacks.onStateChanged(getState());
        }

        // Simpan ke KV
        await saveChatHistory();

        return confirmMessage;
      }

      return null;

    } catch (error) {
      console.warn('[AI Assistant] Smart input gagal, lanjut ke chat biasa:', error.message);
      return null;
    }
  }

  // ============================================================
  // CHAT MESSAGES BUILDER
  // ============================================================

  /**
   * Membangun array messages untuk dikirim ke AI
   * @param {string} currentText - Teks pesan terakhir
   * @returns {Array} Array pesan untuk AI
   */
  function buildChatMessages(currentText) {
    const systemPrompt = getSystemPrompt();
    const messages = [];

    // System prompt
    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Tambahkan konteks modul aktif jika ada
    if (state.activeModule) {
      messages.push({
        role: 'system',
        content: `User sedang melihat modul: ${state.activeModule}. Berikan respons yang relevan dengan modul ini jika memungkinkan.`
      });
    }

    // Riwayat chat (batasi 20 pesan terakhir untuk konteks)
    const recentMessages = state.messages.slice(-20);
    for (const msg of recentMessages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    return messages;
  }

  // ============================================================
  // STREAMING RESPONSE
  // ============================================================

  /**
   * Mendapatkan respons AI dengan streaming
   * @param {Array} messages - Array pesan untuk AI
   * @returns {Promise<Object>} Pesan asisten yang lengkap
   */
  async function streamResponse(messages) {
    state.isStreaming = true;
    state.currentStreamText = '';

    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };

    // Tambahkan placeholder ke messages
    state.messages.push(assistantMessage);

    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    try {
      if (typeof puter === 'undefined' || !puter.ai) {
        throw new Error('puter.ai tidak tersedia');
      }

      // Gunakan streaming jika didukung
      const stream = await puter.ai.chat(messages, {
        model: state.selectedModel,
        stream: true
      });

      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        // AsyncIterable stream
        for await (const chunk of stream) {
          const text = chunk?.text || chunk?.message?.content || chunk?.toString() || '';
          if (text) {
            state.currentStreamText += text;
            assistantMessage.content = state.currentStreamText;

            if (state.callbacks.onStreamingUpdate) {
              state.callbacks.onStreamingUpdate({
                messageId: assistantMessage.id,
                text: state.currentStreamText,
                chunk: text
              });
            }
            if (state.callbacks.onStateChanged) {
              state.callbacks.onStateChanged(getState());
            }
          }
        }
      } else if (stream && typeof stream === 'object') {
        // Respons non-stream yang dikembalikan sebagai object
        const text = stream?.message?.content || stream?.toString() || '';
        state.currentStreamText = text;
        assistantMessage.content = text;
      } else if (typeof stream === 'string') {
        state.currentStreamText = stream;
        assistantMessage.content = stream;
      }

    } catch (error) {
      console.warn('[AI Assistant] Streaming gagal, fallback ke non-streaming:', error.message);
      
      // Fallback ke non-streaming
      try {
        const response = await puter.ai.chat(messages, {
          model: state.selectedModel
        });
        const text = typeof response === 'string' ? response : 
                     response?.message?.content || response?.toString() || '';
        state.currentStreamText = text;
        assistantMessage.content = text;
      } catch (fallbackError) {
        throw fallbackError;
      }
    }

    // Finalisasi pesan
    assistantMessage.content = state.currentStreamText;
    assistantMessage.isStreaming = false;
    state.isStreaming = false;
    state.currentStreamText = '';

    // Callback: stream selesai
    if (state.callbacks.onStreamComplete) {
      state.callbacks.onStreamComplete(assistantMessage);
    }
    if (state.callbacks.onMessageReceived) {
      state.callbacks.onMessageReceived(assistantMessage);
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    // Simpan ke KV
    await saveChatHistory();

    return assistantMessage;
  }

  /**
   * Mendapatkan respons AI tanpa streaming (full response)
   * @param {Array} messages - Array pesan untuk AI
   * @returns {Promise<Object>} Pesan asisten yang lengkap
   */
  async function getFullResponse(messages) {
    if (typeof puter === 'undefined' || !puter.ai) {
      throw new Error('puter.ai tidak tersedia');
    }

    // Gunakan callWithFallback jika tersedia
    let response;
    if (window.YWMAIConfig && window.YWMAIConfig.callWithFallback) {
      response = await window.YWMAIConfig.callWithFallback(
        (m) => puter.ai.chat(messages, { model: m }),
        state.selectedModel
      );
    } else {
      response = await puter.ai.chat(messages, {
        model: state.selectedModel
      );
    }

    const text = typeof response === 'string' ? response : 
                 response?.message?.content || response?.toString() || '';

    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };

    state.messages.push(assistantMessage);

    if (state.callbacks.onMessageReceived) {
      state.callbacks.onMessageReceived(assistantMessage);
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    // Simpan ke KV
    await saveChatHistory();

    return assistantMessage;
  }

  // ============================================================
  // QUICK ACTIONS
  // ============================================================

  /**
   * Menjalankan quick action berdasarkan ID
   * @param {string} actionId - ID quick action
   * @returns {Promise<Object|null>} Respons AI
   */
  async function executeQuickAction(actionId) {
    const config = getChatConfig();
    const action = config.quickActions.find(a => a.id === actionId);
    
    if (!action) {
      console.warn('[AI Assistant] Quick action tidak ditemukan:', actionId);
      return null;
    }

    return await sendMessage(action.prompt, { skipSmartInput: true });
  }

  /**
   * Mendapatkan daftar quick actions
   * @returns {Array} Daftar quick actions
   */
  function getQuickActions() {
    const config = getChatConfig();
    return config.quickActions || [];
  }

  // ============================================================
  // VOICE INPUT INTEGRATION
  // ============================================================

  /**
   * Mulai merekam suara untuk input
   * @returns {Promise<boolean>}
   */
  async function startVoiceInput() {
    if (!window.YWMVoiceHandler) {
      console.error('[AI Assistant] Voice handler tidak tersedia');
      return false;
    }

    // Daftarkan callback voice
    window.YWMVoiceHandler.on('transcriptionComplete', async (data) => {
      // Kirim hasil transkripsi sebagai pesan chat
      if (data.text) {
        await sendMessage(data.text);
      }
      state.isListening = false;
      if (state.callbacks.onVoiceStop) {
        state.callbacks.onVoiceStop({ transcript: data.text });
      }
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }
    });

    window.YWMVoiceHandler.on('transcriptionError', (error) => {
      state.isListening = false;
      if (state.callbacks.onError) {
        state.callbacks.onError({
          type: 'voice_error',
          message: error.message
        });
      }
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }
    });

    const started = await window.YWMVoiceHandler.start();
    
    if (started) {
      state.isListening = true;
      if (state.callbacks.onVoiceStart) {
        state.callbacks.onVoiceStart();
      }
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }
    }

    return started;
  }

  /**
   * Hentikan perekaman suara
   */
  async function stopVoiceInput() {
    if (window.YWMVoiceHandler) {
      await window.YWMVoiceHandler.stop();
    }
    state.isListening = false;
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
  }

  // ============================================================
  // OCR INTEGRATION
  // ============================================================

  /**
   * Proses dokumen melalui OCR dan masukkan konteks ke chat
   * @param {File} file - File gambar/PDF
   * @returns {Promise<Object|null>} Hasil OCR
   */
  async function processDocument(file) {
    if (!window.YWMOCRHandler) {
      console.error('[AI Assistant] OCR handler tidak tersedia');
      return null;
    }

    // Tambahkan pesan tentang dokumen yang diproses
    const docMessage = {
      id: generateId(),
      role: 'user',
      content: `📎 Memproses dokumen: ${file.name}`,
      timestamp: new Date().toISOString(),
      isDocument: true
    };
    state.messages.push(docMessage);
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    try {
      const result = await window.YWMOCRHandler.process(file, {
        autoParse: true,
        autoSave: true,
        classify: true
      });

      if (result) {
        // Tambahkan hasil OCR ke chat
        const classificationLabel = {
          'invoice': 'Invoice/Faktur',
          'receipt': 'Kwitansi',
          'delivery_note': 'Surat Jalan',
          'report': 'Laporan',
          'purchase_order': 'Purchase Order',
          'other': 'Dokumen'
        }[result.classification?.type] || 'Dokumen';

        const ocrMessage = {
          id: generateId(),
          role: 'assistant',
          content: `📄 **Hasil OCR - ${classificationLabel}**\n\n**File:** ${file.name}\n**Tipe:** ${classificationLabel}\n\n**Teks yang diekstrak:**\n\`\`\`\n${(result.text || '').substring(0, 500)}${(result.text || '').length > 500 ? '...' : ''}\n\`\`\`\n\n${result.parsed && !result.parsed.parse_error ? `**Data terstruktur:**\n\`\`\`json\n${JSON.stringify(result.parsed, null, 2)}\n\`\`\`\n\n${result.savedTo ? `✅ Data telah disimpan ke modul **${result.savedTo.module}**` : 'ℹ️ Data belum disimpan ke modul.'}` : '⚠️ Parsing data terstruktur gagal. Anda bisa meminta AI untuk mem-parsing ulang teks di atas.'}`,
          timestamp: new Date().toISOString(),
          isOCRResult: true,
          ocrResult: result
        };

        state.messages.push(ocrMessage);
        await saveChatHistory();

        if (state.callbacks.onMessageReceived) {
          state.callbacks.onMessageReceived(ocrMessage);
        }
        if (state.callbacks.onStateChanged) {
          state.callbacks.onStateChanged(getState());
        }

        return result;
      }

      return null;

    } catch (error) {
      const errorMessage = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Gagal memproses dokumen: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      state.messages.push(errorMessage);
      
      if (state.callbacks.onError) {
        state.callbacks.onError({ type: 'ocr_failed', message: error.message });
      }
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }

      return null;
    }
  }

  // ============================================================
  // REPORT INTEGRATION
  // ============================================================

  /**
   * Generate laporan melalui chat
   * @param {string} reportType - Tipe laporan
   * @param {string} period - Periode
   * @returns {Promise<Object|null>}
   */
  async function generateReport(reportType, period = 'harian') {
    if (!window.YWMReportGenerator) {
      console.error('[AI Assistant] Report generator tidak tersedia');
      return null;
    }

    const reportMessage = {
      id: generateId(),
      role: 'user',
      content: `📊 Membuat laporan ${reportType} (${period})...`,
      timestamp: new Date().toISOString(),
      isReportRequest: true
    };
    state.messages.push(reportMessage);
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    try {
      const report = await window.YWMReportGenerator.generate(reportType, period);

      if (report) {
        const reportMessage = {
          id: generateId(),
          role: 'assistant',
          content: `📊 **${report.label} — ${report.period === 'harian' ? 'Harian' : report.period === 'mingguan' ? 'Mingguan' : 'Bulanan'}**\n\n${report.report}\n\n${report.insights?.length > 0 ? `**Insight:**\n${report.insights.map(i => `- ${i}`).join('\n')}` : ''}\n\n${report.recommendations?.length > 0 ? `**Rekomendasi:**\n${report.recommendations.map(r => `- ${r}`).join('\n')}` : ''}`,
          timestamp: new Date().toISOString(),
          isReport: true,
          reportData: report
        };

        state.messages.push(reportMessage);
        await saveChatHistory();

        if (state.callbacks.onMessageReceived) {
          state.callbacks.onMessageReceived(reportMessage);
        }
        if (state.callbacks.onStateChanged) {
          state.callbacks.onStateChanged(getState());
        }

        return report;
      }

      return null;

    } catch (error) {
      const errorMessage = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Gagal membuat laporan: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      state.messages.push(errorMessage);
      
      if (state.callbacks.onError) {
        state.callbacks.onError({ type: 'report_failed', message: error.message });
      }
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }

      return null;
    }
  }

  // ============================================================
  // CHAT HISTORY PERSISTENCE
  // ============================================================

  /**
   * Menyimpan riwayat chat ke puter.kv
   */
  async function saveChatHistory() {
    try {
      const config = getChatConfig();
      
      if (typeof puter === 'undefined' || !puter.kv) return;

      // Batasi jumlah pesan yang disimpan
      const messagesToSave = state.messages.slice(-config.maxHistoryMessages);
      
      await puter.kv.set(config.historyKey, JSON.stringify({
        messages: messagesToSave,
        lastUpdated: new Date().toISOString(),
        model: state.selectedModel
      }));

    } catch (error) {
      console.warn('[AI Assistant] Gagal menyimpan riwayat chat:', error.message);
    }
  }

  /**
   * Memuat riwayat chat dari puter.kv
   * @returns {Promise<boolean>} Status berhasil/tidak
   */
  async function loadChatHistory() {
    try {
      const config = getChatConfig();
      
      if (typeof puter === 'undefined' || !puter.kv) return false;

      const stored = await puter.kv.get(config.historyKey);
      if (!stored) return false;

      const data = JSON.parse(stored);
      if (data.messages && Array.isArray(data.messages)) {
        state.messages = data.messages;
        
        if (data.model) {
          state.selectedModel = data.model;
        }

        console.log(`[AI Assistant] Riwayat chat dimuat: ${data.messages.length} pesan`);
        
        if (state.callbacks.onStateChanged) {
          state.callbacks.onStateChanged(getState());
        }
        
        return true;
      }

      return false;

    } catch (error) {
      console.warn('[AI Assistant] Gagal memuat riwayat chat:', error.message);
      return false;
    }
  }

  /**
   * Mengosongkan riwayat chat
   */
  async function clearChatHistory() {
    state.messages = [];
    
    try {
      const config = getChatConfig();
      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.del(config.historyKey);
      }
    } catch (error) {
      console.warn('[AI Assistant] Gagal menghapus riwayat dari KV:', error.message);
    }

    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
  }

  // ============================================================
  // MODEL MANAGEMENT
  // ============================================================

  /**
   * Mengganti model AI yang digunakan
   * @param {string} modelId - ID model
   */
  function setModel(modelId) {
    const validModels = ['gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-2.5-flash', 'deepseek-chat'];
    
    if (validModels.includes(modelId)) {
      state.selectedModel = modelId;
      console.log('[AI Assistant] Model diubah ke:', modelId);
      
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }

      // Simpan preferensi
      saveChatHistory();
    } else {
      console.warn('[AI Assistant] Model tidak valid:', modelId);
    }
  }

  /**
   * Mendapatkan daftar model yang tersedia
   * @returns {Array} Daftar model
   */
  function getAvailableModels() {
    if (window.YWMAIConfig && window.YWMAIConfig.AI_MODELS) {
      return Object.values(window.YWMAIConfig.AI_MODELS);
    }
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Default, cepat dan ekonomis' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Analisis dan penulisan' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Konteks panjang' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Reasoning dan coding' }
    ];
  }

  // ============================================================
  // STATE & UTILITY
  // ============================================================

  /**
   * Mendapatkan snapshot state saat ini
   * @returns {Object} State snapshot
   */
  function getState() {
    return {
      messages: [...state.messages],
      isStreaming: state.isStreaming,
      isTyping: state.isTyping,
      isListening: state.isListening,
      currentStreamText: state.currentStreamText,
      selectedModel: state.selectedModel,
      activeModule: state.activeModule,
      messageCount: state.messages.length,
      isOpen: state.isOpen,
      isMinimized: state.isMinimized
    };
  }

  /**
   * Mengatur modul aktif (dari navigasi dashboard)
   * @param {string} moduleId - ID modul
   */
  function setActiveModule(moduleId) {
    state.activeModule = moduleId;
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
  }

  /**
   * Generate ID unik
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  /**
   * Mendapatkan pesan error yang user-friendly
   * @param {Error} error - Error object
   * @returns {string} Pesan error
   */
  function getErrorMessage(error) {
    if (window.YWMAIConfig && window.YWMAIConfig.getErrorMessage) {
      const errorType = error.message?.includes('rate') ? 'rate_limit' :
                        error.message?.includes('timeout') ? 'timeout' :
                        error.message?.includes('network') ? 'network' : 'generic';
      return window.YWMAIConfig.getErrorMessage(errorType);
    }
    return 'Maaf, terjadi kesalahan. Silakan coba lagi.';
  }

  // ============================================================
  // CALLBACK REGISTRATION
  // ============================================================

  function on(event, callback) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = callback;
    } else {
      console.warn(`[AI Assistant] Event tidak dikenal: ${event}`);
    }
  }

  function off(event) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = null;
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Inisialisasi AI Assistant
   * Memuat riwayat chat dan menyiapkan state
   * @returns {Promise<void>}
   */
  async function init() {
    console.log('[AI Assistant] Menginisialisasi...');
    
    state.sessionStartTime = new Date().toISOString();
    state.selectedModel = getChatConfig().defaultModel || 'gpt-4o-mini';

    // Muat riwayat chat
    await loadChatHistory();

    // Tambahkan pesan welcome jika tidak ada riwayat
    if (state.messages.length === 0) {
      const welcomeMessage = {
        id: generateId(),
        role: 'assistant',
        content: `👋 **Selamat datang di YWM AI Assistant!**\n\nSaya adalah asisten AI untuk PT Yoga Wibawa Mandiri. Saya bisa membantu Anda:\n\n📦 **Input Data** — Ketik data dalam bahasa Indonesia, saya akan otomatis menyimpannya ke modul yang tepat\n📊 **Laporan** — Minta laporan harian/mingguan/bulanan untuk setiap modul\n🎤 **Voice Input** — Rekam suara Anda dan saya akan mentranskripsi serta memprosesnya\n📄 **OCR Dokumen** — Upload gambar/PDF dan saya akan mengekstrak datanya\n❓ **Tanya Jawab** — Tanyakan apapun tentang operasional YWM\n\n💡 **Tips:** Coba ketik sesuatu seperti:\n- "Bearing 6205 masuk 20 unit dari PT Sinar"\n- "Produksi shift pagi 5200 zak"\n- "Buat laporan stok spare parts mingguan"`,
        timestamp: new Date().toISOString(),
        isWelcome: true
      };
      state.messages.push(welcomeMessage);
    }

    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    console.log('[AI Assistant] Inisialisasi selesai ✓');
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  const AIAssistant = {
    /**
     * Inisialisasi AI Assistant
     * @returns {Promise<void>}
     */
    init: init,

    /**
     * Kirim pesan chat ke AI
     * @param {string} text - Teks pesan
     * @param {Object} options - { skipSmartInput, forceModule }
     * @returns {Promise<Object|null>}
     */
    sendMessage: sendMessage,

    /**
     * Jalankan quick action
     * @param {string} actionId - ID quick action
     * @returns {Promise<Object|null>}
     */
    executeQuickAction: executeQuickAction,

    /**
     * Dapatkan daftar quick actions
     * @returns {Array}
     */
    getQuickActions: getQuickActions,

    /**
     * Mulai input suara
     * @returns {Promise<boolean>}
     */
    startVoiceInput: startVoiceInput,

    /**
     * Hentikan input suara
     */
    stopVoiceInput: stopVoiceInput,

    /**
     * Proses dokumen melalui OCR
     * @param {File} file - File gambar/PDF
     * @returns {Promise<Object|null>}
     */
    processDocument: processDocument,

    /**
     * Generate laporan
     * @param {string} reportType - Tipe laporan
     * @param {string} period - Periode
     * @returns {Promise<Object|null>}
     */
    generateReport: generateReport,

    /**
     * Ganti model AI
     * @param {string} modelId - ID model
     */
    setModel: setModel,

    /**
     * Dapatkan daftar model yang tersedia
     * @returns {Array}
     */
    getAvailableModels: getAvailableModels,

    /**
     * Dapatkan state saat ini
     * @returns {Object}
     */
    getState: getState,

    /**
     * Atur modul aktif (dari navigasi dashboard)
     * @param {string} moduleId - ID modul
     */
    setActiveModule: setActiveModule,

    /**
     * Kosongkan riwayat chat
     */
    clearHistory: clearChatHistory,

    /**
     * Muat riwayat chat dari KV
     * @returns {Promise<boolean>}
     */
    loadHistory: loadChatHistory,

    /**
     * Simpan riwayat chat ke KV
     * @returns {Promise<void>}
     */
    saveHistory: saveChatHistory,

    /**
     * Daftarkan callback
     * Event: message_sent, message_received, streaming_update, 
     *        stream_complete, error, state_changed, voice_start,
     *        voice_stop, smart_input_processed
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
  window.YWMAIAssistant = AIAssistant;

  console.log('[AI Assistant] Modul AI assistant dimuat ✓');

})();
