/**
 * ============================================================
 * AI Assistant & Agent — Chat Interface + Autonomous Agent
 * untuk YWM Dashboard
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
 * v2.0.0 — Ditambahkan: AI Agent capabilities
 * - Proactive monitoring: Cek stok rendah, WO overdue, anomali produksi
 * - Execute actions: Buat WO, tambah spare part, log kegiatan via API
 * - Autonomous workflows: Chain multiple actions together
 * - Scheduled checks: Periodic background monitoring (setiap 5 menit)
 * - Smart notifications: Proactive alert tentang event penting
 * - agentMode flag: Enable/disable autonomous actions
 * 
 * Dependensi: ai-config.js, smart-input.js, voice-handler.js, 
 *             ocr-handler.js, report-generator.js
 * 
 * @version 2.0.0
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
    
    // NEW: Agent state
    agentMode: true,           // Agent mode aktif/nonaktif
    scheduledCheckTimer: null, // Timer untuk scheduled checks
    lastCheckTime: null,       // Terakhir kali runChecks dijalankan
    pendingActions: [],        // Aksi yang menunggu konfirmasi user
    activeWorkflows: [],       // Workflow yang sedang berjalan
    proactiveAlerts: [],       // Daftar alert proactive
    actionHistory: [],         // Riwayat aksi yang sudah dijalankan
    
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
      onSmartInputProcessed: null,
      // NEW: Agent callbacks
      onActionExecuted: null,
      onProactiveAlert: null,
      onCheckComplete: null,
      onWorkflowStep: null,
      onAgentModeChanged: null
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

  function getAgentConfig() {
    if (window.YWMAIConfig && window.YWMAIConfig.AGENT_CONFIG) {
      return window.YWMAIConfig.AGENT_CONFIG;
    }
    return {
      agentMode: true,
      checkIntervalMs: 5 * 60 * 1000,
      scheduledChecksEnabled: true,
      proactiveAlertsEnabled: true,
      maxAutonomousActionsPerCycle: 3,
      autoExecuteEnabled: false,
      readOnlyActions: ['check_stock', 'check_overdue_wo', 'check_production_anomaly', 'generate_report'],
      confirmationRequiredActions: ['create_wo', 'update_wo', 'add_spare_part', 'create_po', 'log_team_activity', 'run_workflow'],
      thresholds: {
        lowStockEnabled: true,
        overdueWOEnabled: true,
        productionAnomalyThreshold: 0.80,
        productionAnomalyEnabled: true
      },
      stateKey: 'ywm_agent_state',
      alertsKey: 'ywm_agent_alerts',
      auditKey: 'ywm_agent_audit'
    };
  }

  // ============================================================
  // MENGIRIM PESAN (dengan agent action detection)
  // ============================================================

  /**
   * Mengirim pesan user dan mendapatkan respons AI
   * v2: Jika agentMode aktif, coba deteksi apakah input adalah permintaan aksi
   * @param {string} text - Teks pesan dari user
   * @param {Object} options - Opsi { skipSmartInput, forceModule, skipAgent }
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
    // NEW: Cek apakah input adalah permintaan aksi agent
    // ========================================
    if (state.agentMode && !options.skipAgent) {
      const agentResult = await tryAgentAction(text);
      if (agentResult) {
        return agentResult;
      }
    }

    // ========================================
    // Kirim ke AI untuk respons chat biasa
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
  // AI AGENT — Action Detection & Execution
  // ============================================================

  /**
   * Mencoba mendeteksi dan mengeksekusi aksi agent dari input user
   * Menggunakan AI untuk memparse natural language menjadi aksi
   * @param {string} text - Teks input user
   * @returns {Promise<Object|null>} Respons aksi atau null jika bukan aksi
   */
  async function tryAgentAction(text) {
    const agentConfig = getAgentConfig();
    
    // Keyword yang mengindikasikan permintaan aksi
    const actionKeywords = [
      'buat', 'tambah', 'buatkan', 'bikin', 'input', 'masukkan',
      'cek', 'check', 'cekkan', 'periksa', 'cari',
      'update', 'ubah', 'ganti', 'selesaikan',
      'hapus', 'jalankan', 'eksekusi', 'proses',
      'overdue', 'terlambat', 'stok rendah', 'habis',
      'wo baru', 'work order', 'purchase order', 'po baru',
      'laporkan', 'generate', 'alert', 'peringatan',
      'workflow', 'otomatis', 'auto'
    ];
    
    const lowerText = text.toLowerCase();
    const isLikelyAction = actionKeywords.some(kw => lowerText.includes(kw));
    
    if (!isLikelyAction) return null;
    
    try {
      // Gunakan AI untuk parse aksi
      const actionDef = await parseActionWithAI(text);
      
      if (!actionDef || actionDef.action === 'chat') {
        return null; // Bukan aksi, lanjut ke chat biasa
      }
      
      // Eksekusi aksi
      const result = await executeAction(actionDef.action, actionDef.params || {});
      
      if (result) {
        return result;
      }
      
      return null;
      
    } catch (error) {
      console.warn('[AI Agent] Gagal memparse aksi:', error.message);
      return null;
    }
  }

  /**
   * Parse input natural language menjadi definisi aksi menggunakan AI
   * @param {string} text - Input user
   * @returns {Promise<Object>} Definisi aksi { action, params }
   */
  async function parseActionWithAI(text) {
    const prompt = window.YWMAIConfig?.AGENT_ACTION_PARSE_PROMPT || 
      'Parse input menjadi aksi JSON. Jika bukan aksi, output {"action":"chat","params":{}}.';
    
    if (typeof puter === 'undefined' || !puter.ai) {
      // Fallback: simple keyword-based parsing
      return parseActionWithKeywords(text);
    }
    
    try {
      const messages = [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ];
      
      const model = window.YWMAIConfig?.getOptimalModel?.('agent_action_parsing') || 'gpt-4o-mini';
      
      let response;
      if (window.YWMAIConfig && window.YWMAIConfig.callWithFallback) {
        response = await window.YWMAIConfig.callWithFallback(
          (m) => puter.ai.chat(messages, { model: m }),
          model
        );
      } else {
        response = await puter.ai.chat(messages, { model });
      }
      
      const responseText = typeof response === 'string' ? response : 
                           response?.message?.content || response?.toString() || '';
      
      // Ekstrak JSON dari respons
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      return { action: 'chat', params: {} };
      
    } catch (error) {
      console.warn('[AI Agent] AI parsing gagal, menggunakan keyword fallback:', error.message);
      return parseActionWithKeywords(text);
    }
  }

  /**
   * Fallback: Parse aksi menggunakan keyword matching (tanpa AI)
   * @param {string} text - Input user
   * @returns {Object} Definisi aksi { action, params }
   */
  function parseActionWithKeywords(text) {
    const lower = text.toLowerCase();
    
    // Deteksi aksi berdasarkan keyword
    if ((lower.includes('buat') || lower.includes('bikin')) && 
        (lower.includes('wo') || lower.includes('work order'))) {
      return {
        action: 'create_wo',
        params: {
          judul: text.replace(/buatkan?|bikin|wo|work order/gi, '').trim(),
          tipe: lower.includes('darurat') || lower.includes('emergency') ? 'Emergency' : 
                lower.includes('preventive') || lower.includes('pencegahan') ? 'Preventive' : 'Corrective',
          prioritas: lower.includes('critical') || lower.includes('kritis') || lower.includes('darurat') ? 'Critical' :
                     lower.includes('tinggi') || lower.includes('high') ? 'High' : 'Medium'
        }
      };
    }
    
    if ((lower.includes('tambah') || lower.includes('input')) && 
        (lower.includes('spare') || lower.includes('part') || lower.includes('bearing') || lower.includes('belt') || lower.includes('seal'))) {
      return {
        action: 'add_spare_part',
        params: { nama_item: text.replace(/tambahkan?|input|spare|part/gi, '').trim() }
      };
    }
    
    if (lower.includes('cek') && (lower.includes('stok') || lower.includes('stock'))) {
      return {
        action: 'check_stock',
        params: { nama_item: lower.includes('semua') || lower.includes('rendah') ? '' : text.replace(/cek|stok|stock/gi, '').trim() }
      };
    }
    
    if (lower.includes('overdue') || (lower.includes('wo') && (lower.includes('terlambat') || lower.includes('lewat')))) {
      return { action: 'check_overdue_wo', params: {} };
    }
    
    if (lower.includes('anomali') || (lower.includes('produksi') && lower.includes('cek'))) {
      return { action: 'check_production_anomaly', params: {} };
    }
    
    if (lower.includes('catat') && (lower.includes('kegiatan') || lower.includes('aktivitas') || lower.includes('tim'))) {
      return {
        action: 'log_team_activity',
        params: { kegiatan: text.replace(/catat|kegiatan|aktivitas|tim/gi, '').trim() }
      };
    }
    
    if ((lower.includes('buat') || lower.includes('order')) && lower.includes('po')) {
      return {
        action: 'create_po',
        params: { item: text.replace(/buatkan?|order|po/gi, '').trim() }
      };
    }
    
    if (lower.includes('workflow') || lower.includes('otomatis') || lower.includes('auto')) {
      if (lower.includes('stok') || lower.includes('order')) {
        return { action: 'run_workflow', params: { workflow_id: 'low_stock_auto_order' } };
      }
      if (lower.includes('overdue') || lower.includes('wo')) {
        return { action: 'run_workflow', params: { workflow_id: 'overdue_wo_escalation' } };
      }
      if (lower.includes('produksi') || lower.includes('anomali')) {
        return { action: 'run_workflow', params: { workflow_id: 'production_anomaly_alert' } };
      }
      return { action: 'run_workflow', params: { workflow_id: 'daily_checkup' } };
    }
    
    // Default: bukan aksi
    return { action: 'chat', params: {} };
  }

  // ============================================================
  // AI AGENT — Action Execution
  // ============================================================

  /**
   * Mengeksekusi aksi agent
   * Metode ini adalah inti dari AI Agent — menghubungkan AI dengan modul-modul YWM
   * 
   * @param {string} action - ID aksi (create_wo, check_stock, dll.)
   * @param {Object} params - Parameter aksi
   * @returns {Promise<Object>} Respons aksi dalam format pesan chat
   */
  async function executeAction(action, params = {}) {
    const agentConfig = getAgentConfig();
    const actionDef = window.YWMAIConfig?.getAgentAction?.(action);
    
    console.log(`[AI Agent] Menjalankan aksi: ${action}`, params);
    
    // Validasi aksi
    if (!actionDef) {
      const errorMsg = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Aksi "${action}" tidak dikenali. Aksi yang tersedia: ${Object.keys(window.YWMAIConfig?.AGENT_ACTIONS || {}).join(', ')}`,
        timestamp: new Date().toISOString(),
        isActionResult: true,
        actionId: action,
        success: false
      };
      state.messages.push(errorMsg);
      await saveChatHistory();
      return errorMsg;
    }
    
    // Cek apakah aksi memerlukan konfirmasi
    const needsConfirmation = agentConfig.confirmationRequiredActions?.includes(action) && !agentConfig.autoExecuteEnabled;
    
    if (needsConfirmation) {
      // Simpan aksi sebagai pending dan minta konfirmasi
      const pendingAction = {
        id: generateId(),
        action,
        params,
        actionDef,
        timestamp: new Date().toISOString()
      };
      state.pendingActions.push(pendingAction);
      
      const confirmMessage = {
        id: generateId(),
        role: 'assistant',
        content: `🔧 **Konfirmasi Aksi Agent**\n\nSaya akan menjalankan aksi berikut:\n\n**Aksi:** ${actionDef.label}\n**Deskripsi:** ${actionDef.description}\n**Parameter:**\n\`\`\`json\n${JSON.stringify(params, null, 2)}\n\`\`\`\n\n⚠️ Aksi ini akan mengubah data. Ketik **"ya"** untuk konfirmasi atau **"batal"** untuk membatalkan.`,
        timestamp: new Date().toISOString(),
        isActionConfirmation: true,
        pendingActionId: pendingAction.id,
        actionId: action
      };
      
      state.messages.push(confirmMessage);
      if (state.callbacks.onStateChanged) {
        state.callbacks.onStateChanged(getState());
      }
      await saveChatHistory();
      
      return confirmMessage;
    }
    
    // Eksekusi aksi langsung
    return await _performAction(action, params, actionDef);
  }

  /**
   * Internal: Menjalankan aksi yang sudah dikonfirmasi
   * @param {string} action - ID aksi
   * @param {Object} params - Parameter
   * @param {Object} actionDef - Definisi aksi
   * @returns {Promise<Object>} Respons pesan
   */
  async function _performAction(action, params, actionDef) {
    let result = null;
    let success = false;
    let resultContent = '';
    
    try {
      switch (action) {
        // ==========================================
        // CREATE WORK ORDER
        // ==========================================
        case 'create_wo': {
          result = await _createWorkOrder(params);
          break;
        }
        
        // ==========================================
        // UPDATE WORK ORDER
        // ==========================================
        case 'update_wo': {
          result = await _updateWorkOrder(params);
          break;
        }
        
        // ==========================================
        // ADD SPARE PART
        // ==========================================
        case 'add_spare_part': {
          result = await _addSparePart(params);
          break;
        }
        
        // ==========================================
        // CHECK STOCK
        // ==========================================
        case 'check_stock': {
          result = await _checkStock(params);
          break;
        }
        
        // ==========================================
        // LOG TEAM ACTIVITY
        // ==========================================
        case 'log_team_activity': {
          result = await _logTeamActivity(params);
          break;
        }
        
        // ==========================================
        // CREATE PURCHASE ORDER
        // ==========================================
        case 'create_po': {
          result = await _createPurchaseOrder(params);
          break;
        }
        
        // ==========================================
        // CHECK OVERDUE WO
        // ==========================================
        case 'check_overdue_wo': {
          result = await _checkOverdueWO(params);
          break;
        }
        
        // ==========================================
        // GENERATE REPORT
        // ==========================================
        case 'generate_report': {
          result = await _generateReportAction(params);
          break;
        }
        
        // ==========================================
        // CHECK PRODUCTION ANOMALY
        // ==========================================
        case 'check_production_anomaly': {
          result = await _checkProductionAnomaly(params);
          break;
        }
        
        // ==========================================
        // RUN WORKFLOW
        // ==========================================
        case 'run_workflow': {
          result = await _runWorkflow(params);
          break;
        }
        
        default:
          resultContent = `❌ Aksi "${action}" belum diimplementasikan.`;
      }
      
      // Jika result sudah diset oleh handler, gunakan itu
      if (result) {
        success = result.success !== false;
        resultContent = result.content || resultContent;
      }
      
    } catch (error) {
      console.error(`[AI Agent] Gagal mengeksekusi aksi ${action}:`, error);
      success = false;
      resultContent = `❌ Gagal menjalankan aksi ${actionDef?.label || action}: ${error.message}`;
    }
    
    // Catat ke audit log
    await _auditAgentAction(action, params, success, resultContent);
    
    // Buat respons pesan
    const actionMessage = {
      id: generateId(),
      role: 'assistant',
      content: resultContent,
      timestamp: new Date().toISOString(),
      isActionResult: true,
      actionId: action,
      success: success
    };
    
    state.messages.push(actionMessage);
    state.actionHistory.push({
      action,
      params,
      success,
      timestamp: new Date().toISOString()
    });
    
    if (state.callbacks.onActionExecuted) {
      state.callbacks.onActionExecuted({ action, params, success, result: resultContent });
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
    await saveChatHistory();
    
    return actionMessage;
  }

  // ============================================================
  // AI AGENT — Action Handlers
  // ============================================================

  /**
   * Handler: Membuat Work Order baru
   */
  async function _createWorkOrder(params) {
    const mtn = window.YWM?.Modules?.maintenance;
    
    if (!mtn) {
      return { success: false, content: '❌ Modul maintenance tidak tersedia. Pastikan modul sudah dimuat.' };
    }
    
    try {
      // Muat data WO terlebih dahulu
      if (mtn._loadWorkOrders) await mtn._loadWorkOrders();
      
      // Generate nomor WO
      const woNumber = mtn._generateWONumber ? await mtn._generateWONumber() : `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      
      const woData = {
        wo_number: woNumber,
        judul: params.judul || `Maintenance ${params.mesin || 'mesin'}`,
        mesin: params.mesin || 'Lainnya',
        deskripsi: params.deskripsi || params.judul || '',
        tipe: params.tipe || 'Corrective',
        prioritas: params.prioritas || 'Medium',
        status: 'Open',
        assigned_to: params.assigned_to || '',
        due_date: params.due_date || '',
        created_at: new Date().toISOString(),
        created_by: (window.YWM?.PuterInit?.user?.username) || 'ai-agent',
        spare_parts_used: [],
        timeline: [{ status: 'Open', timestamp: new Date().toISOString(), note: 'Dibuat oleh AI Agent' }]
      };
      
      if (mtn._saveWO) {
        const saved = await mtn._saveWO(woData);
        if (saved) {
          return {
            success: true,
            content: `✅ **Work Order berhasil dibuat!**\n\n**Nomor WO:** ${woNumber}\n**Judul:** ${woData.judul}\n**Mesin:** ${woData.mesin}\n**Tipe:** ${woData.tipe}\n**Prioritas:** ${woData.prioritas}\n**Status:** Open\n\nWO sudah tersimpan dan bisa dilihat di modul Maintenance.`
          };
        }
      }
      
      // Fallback: simpan langsung ke KV
      await _kvSet(`ywm:maintenance:wo:${woNumber}`, woData);
      let index = await _kvGet('ywm:maintenance:index:all') || [];
      if (!Array.isArray(index)) index = [];
      if (!index.includes(woNumber)) {
        index.push(woNumber);
        await _kvSet('ywm:maintenance:index:all', index);
      }
      
      return {
        success: true,
        content: `✅ **Work Order berhasil dibuat!**\n\n**Nomor WO:** ${woNumber}\n**Judul:** ${woData.judul}\n**Mesin:** ${woData.mesin}\n**Tipe:** ${woData.tipe}\n**Prioritas:** ${woData.prioritas}\n**Status:** Open\n\nWO sudah tersimpan dan bisa dilihat di modul Maintenance.`
      };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal membuat WO: ${error.message}` };
    }
  }

  /**
   * Handler: Update Work Order
   */
  async function _updateWorkOrder(params) {
    if (!params.wo_number) {
      return { success: false, content: '❌ Nomor WO wajib diisi untuk update.' };
    }
    
    try {
      const woData = await _kvGet(`ywm:maintenance:wo:${params.wo_number}`);
      if (!woData) {
        return { success: false, content: `❌ WO "${params.wo_number}" tidak ditemukan.` };
      }
      
      // Update fields
      if (params.status) woData.status = params.status;
      if (params.completion_notes) woData.completion_notes = params.completion_notes;
      if (params.actual_cost) woData.actual_cost = params.actual_cost;
      woData.updated_at = new Date().toISOString();
      
      // Add timeline entry
      if (!woData.timeline) woData.timeline = [];
      woData.timeline.push({
        status: params.status || woData.status,
        timestamp: new Date().toISOString(),
        note: `Update oleh AI Agent: ${params.completion_notes || params.status || 'Status change'}`
      });
      
      await _kvSet(`ywm:maintenance:wo:${params.wo_number}`, woData);
      
      return {
        success: true,
        content: `✅ **WO ${params.wo_number} berhasil diupdate!**\n\n**Status:** ${woData.status}\n${params.completion_notes ? `**Catatan:** ${params.completion_notes}\n` : ''}${params.actual_cost ? `**Biaya Aktual:** Rp ${Number(params.actual_cost).toLocaleString('id-ID')}\n` : ''}`
      };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal update WO: ${error.message}` };
    }
  }

  /**
   * Handler: Tambah spare part ke inventaris
   */
  async function _addSparePart(params) {
    try {
      const spIndex = await _kvGet('ywm:sparepart:index:all') || [];
      const maxNum = Array.isArray(spIndex) ? spIndex.reduce((max, kode) => {
        const num = parseInt(kode.replace('SP-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0) : 0;
      
      const kode = `SP-${String(maxNum + 1).padStart(3, '0')}`;
      
      const itemData = {
        kode,
        nama_item: params.nama_item || 'Item Baru',
        kategori: params.kategori || 'Lainnya',
        stok: parseInt(params.stok, 10) || 0,
        min_stok: parseInt(params.min_stok, 10) || 0,
        satuan: params.satuan || 'Pcs',
        lokasi_gudang: params.lokasi_gudang || '',
        harga_satuan: parseFloat(params.harga_satuan) || 0,
        part_mesin: params.part_mesin || '',
        catatan: params.catatan || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: (window.YWM?.PuterInit?.user?.username) || 'ai-agent',
        usage_history: []
      };
      
      await _kvSet(`ywm:sparepart:item:${kode}`, itemData);
      
      // Update index
      const newIndex = Array.isArray(spIndex) ? [...spIndex, kode] : [kode];
      await _kvSet('ywm:sparepart:index:all', newIndex);
      
      return {
        success: true,
        content: `✅ **Spare Part berhasil ditambahkan!**\n\n**Kode:** ${kode}\n**Nama:** ${itemData.nama_item}\n**Kategori:** ${itemData.kategori}\n**Stok:** ${itemData.stok} ${itemData.satuan}\n**Lokasi:** ${itemData.lokasi_gudang || '-'}\n\nData sudah tersimpan di modul Spare Parts.`
      };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal menambah spare part: ${error.message}` };
    }
  }

  /**
   * Handler: Cek stok spare part
   */
  async function _checkStock(params) {
    try {
      const spIndex = await _kvGet('ywm:sparepart:index:all') || [];
      if (!Array.isArray(spIndex) || spIndex.length === 0) {
        return {
          success: true,
          content: '📦 Belum ada data spare part di inventaris. Tambahkan spare part terlebih dahulu.'
        };
      }
      
      // Muat semua item
      const items = [];
      for (const kode of spIndex) {
        const item = await _kvGet(`ywm:sparepart:item:${kode}`);
        if (item) items.push(item);
      }
      
      // Filter berdasarkan nama jika ada
      let filteredItems = items;
      if (params.nama_item) {
        const query = params.nama_item.toLowerCase();
        filteredItems = items.filter(i => 
          (i.nama_item || '').toLowerCase().includes(query) ||
          (i.kode || '').toLowerCase().includes(query)
        );
      }
      
      if (filteredItems.length === 0) {
        return {
          success: true,
          content: params.nama_item 
            ? `📦 Tidak ditemukan spare part dengan nama "${params.nama_item}".`
            : '📦 Tidak ada data spare part.'
        };
      }
      
      // Identifikasi stok rendah
      const lowStockItems = filteredItems.filter(i => i.stok <= (i.min_stok || 0));
      const outOfStockItems = filteredItems.filter(i => i.stok === 0);
      
      let content = `📦 **Cek Stok Spare Part**\n\n`;
      content += `**Total Item:** ${filteredItems.length}\n`;
      content += `**Stok Aman:** ${filteredItems.length - lowStockItems.length}\n`;
      content += `**Stok Rendah:** ${lowStockItems.length}\n`;
      content += `**Stok Habis:** ${outOfStockItems.length}\n\n`;
      
      if (lowStockItems.length > 0) {
        content += `⚠️ **Item dengan Stok Rendah/Habis:**\n`;
        for (const item of lowStockItems) {
          const status = item.stok === 0 ? '🔴 HABIS' : '🟡 RENDAH';
          content += `- ${status} **${item.kode}** — ${item.nama_item} (${item.stok}/${item.min_stok || 0} ${item.satuan || 'Pcs'})\n`;
        }
        content += `\n💡 Ketik "auto order stok rendah" untuk membuat Purchase Order otomatis.`;
      } else {
        content += `✅ Semua stok dalam kondisi aman.`;
      }
      
      // Jika ada stok rendah, kirim proactive alert
      if (lowStockItems.length > 0) {
        proactiveAlert(`${lowStockItems.length} spare part memiliki stok rendah/habis`, 'warning');
      }
      
      return { success: true, content };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal mengecek stok: ${error.message}` };
    }
  }

  /**
   * Handler: Catat kegiatan tim
   */
  async function _logTeamActivity(params) {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const activityKey = `ywm:team:activity:${dateStr}`;
      
      // Muat data aktivitas hari ini
      let activityData = await _kvGet(activityKey) || { date: dateStr, activities: [] };
      if (!activityData.activities) activityData.activities = [];
      
      const activity = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        karyawan: params.karyawan || 'Tim',
        kegiatan: params.kegiatan || '',
        kategori: params.kategori || 'Lainnya',
        catatan: params.catatan || '',
        lembur: params.lembur || false,
        timestamp: new Date().toISOString()
      };
      
      activityData.activities.push(activity);
      await _kvSet(activityKey, activityData);
      
      return {
        success: true,
        content: `✅ **Kegiatan tim berhasil dicatat!**\n\n**Karyawan:** ${activity.karyawan}\n**Kegiatan:** ${activity.kegiatan}\n**Kategori:** ${activity.kategori}\n**Tanggal:** ${dateStr}${activity.lembur ? '\n**Lembur:** Ya' : ''}\n\nData tersimpan di modul Tim & Aktivitas.`
      };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal mencatat kegiatan: ${error.message}` };
    }
  }

  /**
   * Handler: Buat Purchase Order
   */
  async function _createPurchaseOrder(params) {
    try {
      const poIndex = await _kvGet('ywm:purchasing:index:all') || [];
      const maxNum = Array.isArray(poIndex) ? poIndex.reduce((max, kode) => {
        const num = parseInt(kode.replace('PO-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0) : 0;
      
      const year = new Date().getFullYear();
      const poNumber = `PO-${year}-${String(maxNum + 1).padStart(4, '0')}`;
      
      const poData = {
        po_number: poNumber,
        item: params.item || '',
        supplier: params.supplier || '',
        jumlah: parseInt(params.jumlah, 10) || 0,
        satuan: params.satuan || 'Pcs',
        harga_satuan: parseFloat(params.harga_satuan) || 0,
        total: (parseInt(params.jumlah, 10) || 0) * (parseFloat(params.harga_satuan) || 0),
        status: 'dibuat',
        created_at: new Date().toISOString(),
        created_by: (window.YWM?.PuterInit?.user?.username) || 'ai-agent'
      };
      
      await _kvSet(`ywm:purchasing:po:${poNumber}`, poData);
      
      const newIndex = Array.isArray(poIndex) ? [...poIndex, poNumber] : [poNumber];
      await _kvSet('ywm:purchasing:index:all', newIndex);
      
      return {
        success: true,
        content: `✅ **Purchase Order berhasil dibuat!**\n\n**Nomor PO:** ${poNumber}\n**Item:** ${poData.item}\n**Supplier:** ${poData.supplier}\n**Jumlah:** ${poData.jumlah} ${poData.satuan}\n**Harga Satuan:** Rp ${(poData.harga_satuan).toLocaleString('id-ID')}\n**Total:** Rp ${(poData.total).toLocaleString('id-ID')}\n**Status:** Dibuat\n\nPO sudah tersimpan di modul Purchasing.`
      };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal membuat PO: ${error.message}` };
    }
  }

  /**
   * Handler: Cek WO overdue
   */
  async function _checkOverdueWO(params) {
    try {
      const woIndex = await _kvGet('ywm:maintenance:index:all') || [];
      if (!Array.isArray(woIndex) || woIndex.length === 0) {
        return {
          success: true,
          content: '📋 Belum ada data Work Order.'
        };
      }
      
      const now = new Date();
      const overdueWOs = [];
      const activeWOs = [];
      
      for (const woNum of woIndex) {
        const wo = await _kvGet(`ywm:maintenance:wo:${woNum}`);
        if (wo && wo.status !== 'Completed' && wo.status !== 'Cancelled') {
          activeWOs.push(wo);
          if (wo.due_date && new Date(wo.due_date) < now) {
            overdueWOs.push(wo);
          }
        }
      }
      
      let content = `🔧 **Cek Work Order Overdue**\n\n`;
      content += `**Total WO Aktif:** ${activeWOs.length}\n`;
      content += `**WO Overdue:** ${overdueWOs.length}\n\n`;
      
      if (overdueWOs.length > 0) {
        content += `🚨 **Work Order Overdue:**\n`;
        for (const wo of overdueWOs) {
          const daysOverdue = Math.floor((now - new Date(wo.due_date)) / (1000 * 60 * 60 * 24));
          content += `- 🔴 **${wo.wo_number}** — ${wo.judul || wo.mesin} (${wo.prioritas}, ${daysOverdue} hari terlambat)\n`;
        }
        content += `\n💡 Ketik "eskalasi WO overdue" untuk membuat WO darurat otomatis.`;
        
        // Proactive alert
        proactiveAlert(`${overdueWOs.length} Work Order overdue!`, 'error');
      } else {
        content += `✅ Tidak ada WO yang overdue. Semua dalam jadwal.`;
      }
      
      return { success: true, content };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal mengecek WO overdue: ${error.message}` };
    }
  }

  /**
   * Handler: Generate laporan
   */
  async function _generateReportAction(params) {
    // Gunakan fungsi generateReport yang sudah ada
    if (params.module) {
      const report = await generateReport(params.module, params.period || 'harian');
      if (report) {
        return { success: true, content: 'Laporan berhasil digenerate. Lihat detail di pesan laporan.' };
      }
    }
    return { success: false, content: '❌ Gagal generate laporan. Pastikan modul dan periode valid.' };
  }

  /**
   * Handler: Cek anomali produksi
   */
  async function _checkProductionAnomaly(params) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const prodData = await _kvGet(`ywm:produksi:data:${today}`);
      
      if (!prodData) {
        // Coba cek data produksi lain
        const prodIndex = await _kvGet('ywm:produksi:index:all') || [];
        if (!Array.isArray(prodIndex) || prodIndex.length === 0) {
          return {
            success: true,
            content: '📊 Belum ada data produksi hari ini. Tidak dapat mengecek anomali.'
          };
        }
      }
      
      // Analisis sederhana berdasarkan data yang ada
      let content = `📊 **Cek Anomali Produksi**\n\n`;
      
      if (prodData) {
        const targetZak = prodData.target_zak || 5500;
        const realisasiZak = prodData.realisasi_zak || 0;
        const percentage = targetZak > 0 ? (realisasiZak / targetZak) : 0;
        const threshold = getAgentConfig().thresholds?.productionAnomalyThreshold || 0.80;
        
        content += `**Target:** ${targetZak} zak\n`;
        content += `**Realisasi:** ${realisasiZak} zak\n`;
        content += `**Pencapaian:** ${(percentage * 100).toFixed(1)}%\n\n`;
        
        if (percentage < threshold && realisasiZak > 0) {
          content += `🚨 **ANOMALI TERDETEKSI!** Produksi di bawah ${(threshold * 100)}% target.\n`;
          content += `💡 Ketik "alert anomali produksi" untuk membuat WO corrective otomatis.`;
          proactiveAlert(`Anomali produksi: hanya ${(percentage * 100).toFixed(1)}% dari target`, 'error');
        } else if (realisasiZak === 0) {
          content += `⚠️ Belum ada realisasi produksi hari ini.`;
        } else {
          content += `✅ Produksi dalam batas normal.`;
        }
      } else {
        content += `⚠️ Tidak ada data produksi yang cukup untuk analisis anomali.`;
      }
      
      return { success: true, content };
      
    } catch (error) {
      return { success: false, content: `❌ Gagal mengecek anomali produksi: ${error.message}` };
    }
  }

  /**
   * Handler: Jalankan workflow
   */
  async function _runWorkflow(params) {
    const workflowId = params.workflow_id;
    if (!workflowId) {
      return { success: false, content: '❌ ID Workflow wajib diisi.' };
    }
    
    const workflow = window.YWMAIConfig?.getAgentWorkflow?.(workflowId);
    if (!workflow) {
      return { success: false, content: `❌ Workflow "${workflowId}" tidak ditemukan.` };
    }
    
    let content = `🔄 **Menjalankan Workflow: ${workflow.label}**\n\n`;
    content += `**Deskripsi:** ${workflow.description}\n\n`;
    content += `**Langkah-langkah:**\n`;
    
    const results = [];
    const steps = workflow.steps || [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      content += `${i + 1}. ${step.description || step.action}... `;
      
      try {
        // Merge params dari workflow definition dengan params dari user
        const stepParams = { ...step.params, ...(params.params || {}) };
        
        // Jika step menggunakan hasil sebelumnya, skip untuk sekarang 
        // (akan memerlukan AI untuk mengisi parameter dinamis)
        const stepResult = await _performAction(step.action, stepParams, 
          window.YWMAIConfig?.getAgentAction?.(step.action) || { id: step.action, label: step.action });
        
        results.push({ step: i, action: step.action, success: stepResult?.success !== false });
        content += stepResult?.success !== false ? '✅\n' : '❌\n';
        
        if (state.callbacks.onWorkflowStep) {
          state.callbacks.onWorkflowStep({
            workflowId,
            stepIndex: i,
            action: step.action,
            success: stepResult?.success !== false
          });
        }
        
      } catch (error) {
        results.push({ step: i, action: step.action, success: false, error: error.message });
        content += `❌ (${error.message})\n`;
      }
    }
    
    const allSuccess = results.every(r => r.success);
    content += `\n${allSuccess ? '✅ **Workflow selesai berhasil!**' : '⚠️ **Workflow selesai dengan beberapa langkah gagal.**'}`;
    
    // Hapus pesan-pesan intermediate dari _performAction (mereka sudah ditambahkan ke state.messages)
    // Biarkan pesan workflow summary sebagai respons utama
    return { success: allSuccess, content };
  }

  // ============================================================
  // AI AGENT — Scheduled Monitoring (runChecks)
  // ============================================================

  /**
   * Menjalankan pengecekan berkala untuk monitoring
   * Metode ini dipanggil secara periodik oleh timer, atau manual
   * 
   * Cek yang dijalankan:
   * 1. Stok spare part rendah
   * 2. WO overdue
   * 3. Anomali produksi
   * 
   * @returns {Promise<Object>} Hasil pengecekan
   */
  async function runChecks() {
    const agentConfig = getAgentConfig();
    
    if (!state.agentMode) {
      return { checks: [], alerts: [] };
    }
    
    console.log('[AI Agent] Menjalankan scheduled checks...');
    state.lastCheckTime = new Date().toISOString();
    
    const checks = [];
    const alerts = [];
    
    try {
      // 1. Cek stok rendah
      if (agentConfig.thresholds?.lowStockEnabled) {
        try {
          const stockResult = await _checkStock({});
          checks.push({ type: 'stock', success: stockResult.success, data: stockResult.content });
          
          // Jika ada stok rendah, buat alert
          if (stockResult.content && stockResult.content.includes('Stok Rendah')) {
            const match = stockResult.content.match(/Stok Rendah:\*\* (\d+)/);
            const count = match ? parseInt(match[1], 10) : 0;
            if (count > 0) {
              alerts.push({
                type: 'low_stock',
                severity: 'warning',
                message: `${count} spare part memiliki stok rendah/habis`,
                action: 'check_stock',
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (e) {
          checks.push({ type: 'stock', success: false, error: e.message });
        }
      }
      
      // 2. Cek WO overdue
      if (agentConfig.thresholds?.overdueWOEnabled) {
        try {
          const woResult = await _checkOverdueWO({});
          checks.push({ type: 'overdue_wo', success: woResult.success, data: woResult.content });
          
          if (woResult.content && woResult.content.includes('Overdue:**')) {
            const match = woResult.content.match(/WO Overdue:\*\* (\d+)/);
            const count = match ? parseInt(match[1], 10) : 0;
            if (count > 0) {
              alerts.push({
                type: 'overdue_wo',
                severity: 'error',
                message: `${count} Work Order overdue!`,
                action: 'check_overdue_wo',
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (e) {
          checks.push({ type: 'overdue_wo', success: false, error: e.message });
        }
      }
      
      // 3. Cek anomali produksi
      if (agentConfig.thresholds?.productionAnomalyEnabled) {
        try {
          const prodResult = await _checkProductionAnomaly({});
          checks.push({ type: 'production', success: prodResult.success, data: prodResult.content });
          
          if (prodResult.content && prodResult.content.includes('ANOMALI TERDETEKSI')) {
            alerts.push({
              type: 'production_anomaly',
              severity: 'error',
              message: 'Anomali produksi terdeteksi!',
              action: 'check_production_anomaly',
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          checks.push({ type: 'production', success: false, error: e.message });
        }
      }
      
    } catch (error) {
      console.error('[AI Agent] Error saat runChecks:', error);
    }
    
    // Kirim proactive alerts untuk setiap alert yang ditemukan
    for (const alert of alerts) {
      proactiveAlert(alert.message, alert.severity);
    }
    
    // Simpan state agent
    await _saveAgentState();
    
    if (state.callbacks.onCheckComplete) {
      state.callbacks.onCheckComplete({ checks, alerts, timestamp: state.lastCheckTime });
    }
    
    console.log(`[AI Agent] Checks selesai. ${checks.length} checks, ${alerts.length} alerts.`);
    
    return { checks, alerts, timestamp: state.lastCheckTime };
  }

  // ============================================================
  // AI AGENT — Proactive Alerts
  // ============================================================

  /**
   * Mengirim notifikasi proactive ke user
   * Alert muncul sebagai pesan system di chat dan/atau toast notification
   * 
   * @param {string} message - Pesan alert
   * @param {string} type - Tipe: 'info', 'warning', 'error', 'success'
   * @returns {Object} Alert yang dikirim
   */
  function proactiveAlert(message, type = 'info') {
    const agentConfig = getAgentConfig();
    
    if (!state.agentMode || !agentConfig.proactiveAlertsEnabled) {
      return null;
    }
    
    const alert = {
      id: generateId(),
      message,
      type, // info, warning, error, success
      timestamp: new Date().toISOString(),
      dismissed: false
    };
    
    state.proactiveAlerts.push(alert);
    
    // Tambahkan sebagai pesan system di chat
    const alertIcons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨',
      success: '✅'
    };
    
    const alertMessage = {
      id: generateId(),
      role: 'assistant',
      content: `${alertIcons[type] || '🔔'} **[Agent Alert]** ${message}`,
      timestamp: new Date().toISOString(),
      isProactiveAlert: true,
      alertType: type,
      alertId: alert.id
    };
    
    state.messages.push(alertMessage);
    
    // Juga tampilkan toast notification jika YWM.UI tersedia
    if (window.YWM?.UI?.showToast) {
      window.YWM.UI.showToast(`🤖 ${message}`, type);
    }
    
    if (state.callbacks.onProactiveAlert) {
      state.callbacks.onProactiveAlert(alert);
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
    
    // Simpan async
    saveChatHistory().catch(e => console.warn('[Agent] Gagal simpan setelah alert:', e));
    
    return alert;
  }

  // ============================================================
  // AI AGENT — Confirm / Cancel Pending Actions
  // ============================================================

  /**
   * Konfirmasi aksi yang pending
   * @param {string} pendingActionId - ID aksi pending
   * @returns {Promise<Object|null>} Hasil eksekusi aksi
   */
  async function confirmAction(pendingActionId) {
    const idx = state.pendingActions.findIndex(a => a.id === pendingActionId);
    if (idx === -1) return null;
    
    const pending = state.pendingActions.splice(idx, 1)[0];
    return await _performAction(pending.action, pending.params, pending.actionDef);
  }

  /**
   * Batalkan aksi yang pending
   * @param {string} pendingActionId - ID aksi pending
   * @returns {boolean} Berhasil dibatalkan atau tidak
   */
  function cancelAction(pendingActionId) {
    const idx = state.pendingActions.findIndex(a => a.id === pendingActionId);
    if (idx === -1) return false;
    
    state.pendingActions.splice(idx, 1);
    
    const cancelMessage = {
      id: generateId(),
      role: 'assistant',
      content: '🚫 Aksi dibatalkan.',
      timestamp: new Date().toISOString(),
      isActionResult: true,
      actionId: 'cancel',
      success: true
    };
    state.messages.push(cancelMessage);
    
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
    
    return true;
  }

  // ============================================================
  // AI AGENT — Mode Control
  // ============================================================

  /**
   * Aktifkan/nonaktifkan agent mode
   * @param {boolean} enabled - true untuk aktif, false untuk nonaktif
   */
  function setAgentMode(enabled) {
    state.agentMode = !!enabled;
    
    if (state.agentMode) {
      _startScheduledChecks();
      console.log('[AI Agent] Agent mode diaktifkan');
    } else {
      _stopScheduledChecks();
      console.log('[AI Agent] Agent mode dinonaktifkan');
    }
    
    if (state.callbacks.onAgentModeChanged) {
      state.callbacks.onAgentModeChanged(state.agentMode);
    }
    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }
  }

  /**
   * Mendapatkan status agent mode
   * @returns {boolean}
   */
  function isAgentMode() {
    return state.agentMode;
  }

  // ============================================================
  // AI AGENT — Scheduled Checks Timer
  // ============================================================

  /**
   * Mulai scheduled checks (internal)
   * @private
   */
  function _startScheduledChecks() {
    const agentConfig = getAgentConfig();
    
    if (!agentConfig.scheduledChecksEnabled) return;
    if (state.scheduledCheckTimer) return; // Sudah berjalan
    
    // Jalankan check pertama kali
    runChecks().catch(e => console.warn('[Agent] First check gagal:', e));
    
    // Set interval
    const interval = agentConfig.checkIntervalMs || 5 * 60 * 1000;
    state.scheduledCheckTimer = setInterval(async () => {
      try {
        await runChecks();
      } catch (e) {
        console.warn('[Agent] Scheduled check gagal:', e);
      }
    }, interval);
    
    console.log(`[AI Agent] Scheduled checks dimulai (interval: ${interval / 1000}s)`);
  }

  /**
   * Hentikan scheduled checks (internal)
   * @private
   */
  function _stopScheduledChecks() {
    if (state.scheduledCheckTimer) {
      clearInterval(state.scheduledCheckTimer);
      state.scheduledCheckTimer = null;
      console.log('[AI Agent] Scheduled checks dihentikan');
    }
  }

  // ============================================================
  // AI AGENT — State Persistence
  // ============================================================

  /**
   * Simpan state agent ke KV
   * @private
   */
  async function _saveAgentState() {
    const agentConfig = getAgentConfig();
    try {
      const agentState = {
        agentMode: state.agentMode,
        lastCheckTime: state.lastCheckTime,
        proactiveAlerts: state.proactiveAlerts.slice(-50), // Simpan 50 terakhir
        actionHistory: state.actionHistory.slice(-100),    // Simpan 100 terakhir
        savedAt: new Date().toISOString()
      };
      
      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set(agentConfig.stateKey, JSON.stringify(agentState));
      }
    } catch (e) {
      console.warn('[Agent] Gagal simpan state:', e.message);
    }
  }

  /**
   * Muat state agent dari KV
   * @private
   */
  async function _loadAgentState() {
    const agentConfig = getAgentConfig();
    try {
      if (typeof puter === 'undefined' || !puter.kv) return;
      
      const stored = await puter.kv.get(agentConfig.stateKey);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      if (data) {
        state.lastCheckTime = data.lastCheckTime || null;
        state.proactiveAlerts = data.proactiveAlerts || [];
        state.actionHistory = data.actionHistory || [];
        // Jangan override agentMode — gunakan nilai dari config/init
      }
    } catch (e) {
      console.warn('[Agent] Gagal muat state:', e.message);
    }
  }

  /**
   * Catat aksi agent ke audit log
   * @private
   */
  async function _auditAgentAction(action, params, success, result) {
    try {
      if (window.YWM?.Data?.addAuditLog) {
        await window.YWM.Data.addAuditLog('ai-agent', action, {
          params: params,
          success: success,
          resultPreview: (result || '').substring(0, 200)
        });
      }
    } catch (e) {
      console.warn('[Agent] Gagal catat audit:', e.message);
    }
  }

  // ============================================================
  // AI AGENT — KV Helpers (reuse existing patterns)
  // ============================================================

  async function _kvGet(key) {
    try {
      if (window.YWM?.Data && typeof window.YWM.Data.get === 'function') {
        return await window.YWM.Data.get(key);
      }
      if (typeof puter !== 'undefined' && puter.kv) {
        const val = await puter.kv.get(key);
        return val ? JSON.parse(val) : null;
      }
      return null;
    } catch (e) {
      console.warn('[AI Agent] KV get gagal:', key, e.message);
      return null;
    }
  }

  async function _kvSet(key, value) {
    try {
      if (window.YWM?.Data && typeof window.YWM.Data.setWithTimestamp === 'function') {
        return await window.YWM.Data.setWithTimestamp(key, value);
      }
      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set(key, JSON.stringify(value));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AI Agent] KV set gagal:', key, e.message);
      return false;
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
    
    // NEW: Tambahkan konteks agent jika aktif
    if (state.agentMode) {
      messages.push({
        role: 'system',
        content: `Agent mode aktif. Kamu bisa menjalankan aksi selain menjawab pertanyaan. Jika user meminta sesuatu yang memerlukan aksi (membuat WO, menambah spare part, dll.), sarankan aksi yang tepat.`
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
      });
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
        await puter.kv.delete(config.historyKey);
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
      isMinimized: state.isMinimized,
      // NEW: Agent state
      agentMode: state.agentMode,
      lastCheckTime: state.lastCheckTime,
      pendingActions: [...state.pendingActions],
      proactiveAlerts: [...state.proactiveAlerts],
      actionHistory: state.actionHistory.slice(-20)
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
   * Inisialisasi AI Assistant & Agent
   * Memuat riwayat chat, state agent, dan menyiapkan scheduled checks
   * @returns {Promise<void>}
   */
  async function init() {
    console.log('[AI Assistant] Menginisialisasi...');
    
    state.sessionStartTime = new Date().toISOString();
    state.selectedModel = getChatConfig().defaultModel || 'gpt-4o-mini';

    // Muat riwayat chat
    await loadChatHistory();

    // NEW: Muat state agent
    await _loadAgentState();

    // Tambahkan pesan welcome jika tidak ada riwayat
    if (state.messages.length === 0) {
      const welcomeMessage = {
        id: generateId(),
        role: 'assistant',
        content: `👋 **Selamat datang di YWM AI Assistant & Agent!**\n\nSaya adalah asisten AI & Agent untuk PT Yoga Wibawa Mandiri. Saya bisa membantu Anda:\n\n📦 **Input Data** — Ketik data dalam bahasa Indonesia, saya akan otomatis menyimpannya ke modul yang tepat\n📊 **Laporan** — Minta laporan harian/mingguan/bulanan untuk setiap modul\n🎤 **Voice Input** — Rekam suara Anda dan saya akan mentranskripsi serta memprosesnya\n📄 **OCR Dokumen** — Upload gambar/PDF dan saya akan mengekstrak datanya\n❓ **Tanya Jawab** — Tanyakan apapun tentang operasional YWM\n\n🤖 **Agent Mode** — Saya juga bisa:\n- 🔍 **Monitor otomatis** — Cek stok rendah, WO overdue, anomali produksi\n- 🔧 **Jalankan aksi** — Buat WO, tambah spare part, catat kegiatan\n- 🔄 **Workflow otomatis** — Chain aksi (misal: stok rendah → auto order)\n- 🔔 **Proactive alerts** — Peringatan otomatis tentang event penting\n\n💡 **Tips:** Coba ketik sesuatu seperti:\n- "Buat WO untuk packer 2, corrective, prioritas tinggi"\n- "Cek stok spare part yang rendah"\n- "Ada WO yang overdue?"\n- "Auto order stok rendah"`,
        timestamp: new Date().toISOString(),
        isWelcome: true
      };
      state.messages.push(welcomeMessage);
    }

    if (state.callbacks.onStateChanged) {
      state.callbacks.onStateChanged(getState());
    }

    // NEW: Mulai scheduled checks jika agent mode aktif
    if (state.agentMode) {
      _startScheduledChecks();
    }

    console.log('[AI Assistant] Inisialisasi selesai ✓');
  }

  /**
   * Menghentikan agent (cleanup saat app ditutup)
   */
  function destroy() {
    _stopScheduledChecks();
    _saveAgentState().catch(e => console.warn('[Agent] Gagal simpan state saat destroy:', e));
    console.log('[AI Assistant] Destroyed ✓');
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  const AIAssistant = {
    /**
     * Inisialisasi AI Assistant & Agent
     * @returns {Promise<void>}
     */
    init: init,

    /**
     * Cleanup agent (stop timers, save state)
     */
    destroy: destroy,

    /**
     * Kirim pesan chat ke AI
     * @param {string} text - Teks pesan
     * @param {Object} options - { skipSmartInput, forceModule, skipAgent }
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
     *        voice_stop, smart_input_processed,
     *        NEW: action_executed, proactive_alert, check_complete,
     *        workflow_step, agent_mode_changed
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on: on,

    /**
     * Hapus callback
     * @param {string} event - Event name
     */
    off: off,

    // ============================================================
    // NEW: AI AGENT PUBLIC API
    // ============================================================

    /**
     * Eksekusi aksi agent
     * Metode utama untuk menjalankan aksi AI Agent
     * 
     * Aksi yang tersedia:
     * - create_wo: Buat Work Order
     * - update_wo: Update Work Order
     * - add_spare_part: Tambah spare part ke inventaris
     * - check_stock: Cek stok spare part
     * - log_team_activity: Catat kegiatan tim
     * - create_po: Buat Purchase Order
     * - check_overdue_wo: Cek WO overdue
     * - generate_report: Generate laporan
     * - check_production_anomaly: Cek anomali produksi
     * - run_workflow: Jalankan workflow otomatis
     * 
     * @param {string} action - ID aksi
     * @param {Object} params - Parameter aksi
     * @returns {Promise<Object>} Respons aksi
     */
    executeAction: executeAction,

    /**
     * Jalankan pengecekan berkala (monitoring)
     * Cek: stok rendah, WO overdue, anomali produksi
     * @returns {Promise<Object>} { checks, alerts, timestamp }
     */
    runChecks: runChecks,

    /**
     * Kirim proactive alert ke user
     * @param {string} message - Pesan alert
     * @param {string} type - Tipe: 'info', 'warning', 'error', 'success'
     * @returns {Object} Alert object
     */
    proactiveAlert: proactiveAlert,

    /**
     * Aktifkan/nonaktifkan agent mode
     * @param {boolean} enabled - true untuk aktif
     */
    setAgentMode: setAgentMode,

    /**
     * Cek apakah agent mode aktif
     * @returns {boolean}
     */
    isAgentMode: isAgentMode,

    /**
     * Konfirmasi aksi pending
     * @param {string} pendingActionId - ID aksi pending
     * @returns {Promise<Object|null>}
     */
    confirmAction: confirmAction,

    /**
     * Batalkan aksi pending
     * @param {string} pendingActionId - ID aksi pending
     * @returns {boolean}
     */
    cancelAction: cancelAction
  };

  // Export ke global scope — YWMAIAssistant tetap kompatibel
  window.YWMAIAssistant = AIAssistant;
  
  // NEW: Juga export sebagai YWM.AI untuk akses yang lebih terstruktur
  window.YWM = window.YWM || {};
  window.YWM.AI = AIAssistant;

  console.log('[AI Assistant] Modul AI assistant & agent dimuat ✓');

})();
