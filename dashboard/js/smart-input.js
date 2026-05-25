/**
 * ============================================================
 * Smart Input — Input Data Bahasa Natural untuk YWM Dashboard
 * ============================================================
 * 
 * Modul ini menangani:
 * - Parsing input bahasa natural menjadi data terstruktur per modul
 * - Deteksi otomatis modul yang sesuai dengan input
 * - Auto-route data terstruktur ke fungsi save modul yang benar
 * - Contoh:
 *   "Bearing 6205 masuk 20 unit dari supplier PT Sinar, gudang A2"
 *   → { module: "spare-parts", action: "masuk", data: { nama: "Bearing 6205", jumlah: 20, ... } }
 *
 *   "Tim maintenance shift pagi sudah selesai cek conveyor belt line 3"
 *   → { module: "team", action: "log", data: { kegiatan: "Cek conveyor belt line 3", ... } }
 *
 *   "Jadwal maintenance pompa hydraulic minggu depan"
 *   → { module: "maintenance", action: "jadwal", data: { item: "Pompa hydraulic", ... } }
 * 
 * Menggunakan puter.ai.chat() dengan structured output prompt untuk parsing
 * Data disimpan ke puter.kv dengan key pattern per modul
 * 
 * Dependensi: ai-config.js (untuk MODULE_PROMPTS, MODULE_DETECTION_PROMPT, KV_KEYS)
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
    isProcessing: false,        // Sedang memproses input
    lastResult: null,           // Hasil parsing terakhir
    processingHistory: [],      // Riwayat pemrosesan (in-memory)
    callbacks: {                // Callback functions
      onProcessingStart: null,
      onModuleDetected: null,
      onParsingComplete: null,
      onSaveComplete: null,
      onError: null
    }
  };

  // ============================================================
  // KONFIGURASI
  // ============================================================

  function getKVKeys() {
    if (window.YWMAIConfig && window.YWMAIConfig.KV_KEYS) {
      return window.YWMAIConfig.KV_KEYS;
    }
    return {
      smartInputCache: 'ywm_smart_input_',
      moduleData: {
        'spare-parts': 'ywm_spare_parts',
        'team': 'ywm_team_activities',
        'maintenance': 'ywm_work_orders',
        'produksi': 'ywm_produksi',
        'keuangan': 'ywm_keuangan',
        'hse': 'ywm_hse',
        'hr': 'ywm_hr',
        'purchasing': 'ywm_purchasing',
        'distribusi': 'ywm_distribusi'
      }
    };
  }

  // ============================================================
  // DETEKSI MODUL OTOMATIS
  // ============================================================

  /**
   * Mendeteksi modul yang paling sesuai dengan input natural language
   * @param {string} input - Input bahasa natural dari user
   * @returns {Promise<string>} ID modul yang terdeteksi
   */
  async function detectModule(input) {
    if (!input || input.trim().length === 0) {
      return 'spare-parts'; // Default fallback
    }

    try {
      // Metode 1: AI-based classification
      const model = window.YWMAIConfig ? window.YWMAIConfig.getOptimalModel('module_detection') : 'gpt-4o-mini';
      const detectionPrompt = window.YWMAIConfig ? window.YWMAIConfig.MODULE_DETECTION_PROMPT : '';

      const prompt = `${detectionPrompt}

Input user: "${input}"

Output HANYA nama modul, tanpa penjelasan:`;

      const response = await callAI(model, prompt);
      
      // Bersihkan respons — ambil hanya nama modul
      const cleaned = (typeof response === 'string' ? response : response?.toString() || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z\-]/g, '');

      // Validasi apakah modul yang terdeteksi valid
      const validModules = [
        'spare-parts', 'team', 'maintenance', 'produksi',
        'keuangan', 'hse', 'hr', 'purchasing', 'distribusi'
      ];

      if (validModules.includes(cleaned)) {
        console.log(`[Smart Input] Modul terdeteksi (AI): ${cleaned}`);
        return cleaned;
      }

      // Fallback ke keyword-based detection
      return detectModuleByKeywords(input);

    } catch (error) {
      console.warn('[Smart Input] AI detection gagal, menggunakan keyword fallback:', error.message);
      return detectModuleByKeywords(input);
    }
  }

  /**
   * Deteksi modul berdasarkan kata kunci (fallback)
   * @param {string} input - Input bahasa natural
   * @returns {string} ID modul
   */
  function detectModuleByKeywords(input) {
    const lower = input.toLowerCase();

    // Keyword mapping per modul — diurutkan dari spesifik ke umum
    const keywordMap = {
      'spare-parts': [
        'spare part', 'bearing', 'belt', 'seal', 'gasket', 'bolt', 'nut',
        'stok', 'inventory', 'gudang', 'masuk', 'keluar', 'reorder',
        'komponen', 'part', 'gear', 'motor', 'valve', 'pump',
        'v-belt', 'roller', 'chain', 'filter', 'oil', 'grease',
        'rak', 'penyimpanan', 'minimum'
      ],
      'maintenance': [
        'maintenance', 'perbaikan', 'servis', 'service', 'jadwal pm',
        'work order', 'wo-', 'preventive', 'corrective', 'predictive',
        'emergency', 'mogok', 'rusak', 'breakdown', 'overhaul',
        'inspeksi', 'cek mesin', 'perawatan', 'dijadwalkan'
      ],
      'team': [
        'tim', 'shift', 'kegiatan', 'pagi', 'siang', 'malam',
        'absen', 'hadir', 'lembur', 'check in', 'check out',
        'laporan kerja', 'kinerja', 'pic', 'leader'
      ],
      'produksi': [
        'produksi', 'zak', 'tonase', 'ton', 'output', 'target',
        'packing', 'filling', 'downtime', 'oee', 'yield',
        'batch', 'silo', 'realisasi', 'shift produksi'
      ],
      'keuangan': [
        'keuangan', 'bayar', 'pembayaran', 'invoice', 'kwitansi',
        'pemasukan', 'pengeluaran', 'budget', 'cashflow', 'lunas',
        'transfer', 'tagihan', 'hutang', 'piutang', 'biaya'
      ],
      'hse': [
        'hse', 'safety', 'keselamatan', 'insiden', 'kecelakaan',
        'near miss', 'apd', 'apar', 'inspeksi safety', 'bahaya',
        'debu', 'kebisingan', 'p3k', 'evakuasi', 'danger'
      ],
      'hr': [
        'karyawan', 'pegawai', 'cuti', 'rekrutmen', 'jabatan',
        'divisi', 'posisi', 'gaji', 'payroll', 'absensi',
        'level', 'sertifikasi', 'training', 'mutasi'
      ],
      'purchasing': [
        'purchasing', 'pembelian', 'order', 'po-', 'supplier',
        'procurement', 'rfq', 'quotation', 'penawaran', 'delivery',
        'terima barang', 'grn'
      ],
      'distribusi': [
        'distribusi', 'pengiriman', 'truk', 'loading', 'kendaraan',
        'pelanggan', 'tujuan', 'ekspedisi', 'surat jalan',
        'do-', 'dispatch', 'on the way'
      ]
    };

    // Hitung skor per modul berdasarkan kecocokan keyword
    const scores = {};
    for (const [module, keywords] of Object.entries(keywordMap)) {
      scores[module] = 0;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          scores[module] += 1;
        }
      }
    }

    // Temukan modul dengan skor tertinggi
    let bestModule = 'spare-parts'; // Default
    let bestScore = 0;

    for (const [module, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestModule = module;
      }
    }

    // Jika tidak ada keyword yang cocok, gunakan spare-parts sebagai default
    if (bestScore === 0) {
      bestModule = 'spare-parts';
    }

    console.log(`[Smart Input] Modul terdeteksi (keyword): ${bestModule} (skor: ${bestScore})`);
    return bestModule;
  }

  // ============================================================
  // PARSING INPUT KE DATA TERSTRUKTUR
  // ============================================================

  /**
   * Memproses input bahasa natural menjadi data terstruktur
   * @param {string} input - Input bahasa natural
   * @param {string} forceModule - Opsional: paksa modul tertentu
   * @returns {Promise<Object>} Data terstruktur { module, action, data, confidence }
   */
  async function processInput(input, forceModule = null) {
    if (!input || input.trim().length === 0) {
      console.warn('[Smart Input] Input kosong');
      return null;
    }

    state.isProcessing = true;

    // Callback: proses dimulai
    if (state.callbacks.onProcessingStart) {
      state.callbacks.onProcessingStart({ input });
    }

    try {
      // ========================================
      // LANGKAH 1: Deteksi modul
      // ========================================
      let module = forceModule;
      if (!module) {
        module = await detectModule(input);
      }

      // Callback: modul terdeteksi
      if (state.callbacks.onModuleDetected) {
        state.callbacks.onModuleDetected({ module, input });
      }

      // ========================================
      // LANGKAH 2: Parse input dengan prompt modul
      // ========================================
      const parsedData = await parseWithModulePrompt(input, module);

      // ========================================
      // LANGKAH 3: Validasi dan perbaiki hasil
      // ========================================
      const validatedData = validateAndFix(parsedData, module);

      const result = {
        module: validatedData.module || module,
        action: validatedData.action || 'input',
        data: validatedData.data || validatedData,
        confidence: parsedData.confidence || 0.8,
        originalInput: input,
        timestamp: new Date().toISOString()
      };

      // Simpan ke state
      state.lastResult = result;
      state.processingHistory.push({
        input: input.substring(0, 100),
        module: result.module,
        action: result.action,
        timestamp: result.timestamp
      });

      // Batasi riwayat in-memory
      if (state.processingHistory.length > 50) {
        state.processingHistory = state.processingHistory.slice(-50);
      }

      // Callback: parsing selesai
      if (state.callbacks.onParsingComplete) {
        state.callbacks.onParsingComplete(result);
      }

      // ========================================
      // LANGKAH 4: Auto-save ke modul
      // ========================================
      const saveResult = await saveToModule(result.module, result);

      // Callback: save selesai
      if (state.callbacks.onSaveComplete) {
        state.callbacks.onSaveComplete({ module: result.module, result: saveResult });
      }

      console.log(`[Smart Input] Input diproses → modul: ${result.module}, action: ${result.action}`);
      return result;

    } catch (error) {
      console.error('[Smart Input] Gagal memproses input:', error);

      if (state.callbacks.onError) {
        const getErrMsg = window.YWMAIConfig?.getErrorMessage;
        const errorMessage = getErrMsg ? getErrMsg('generic') : 'Gagal memproses input. Silakan coba lagi.';
        state.callbacks.onError({
          type: 'parsing_failed',
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
   * Parsing input menggunakan prompt spesifik modul
   * @param {string} input - Input bahasa natural
   * @param {string} moduleId - ID modul
   * @returns {Promise<Object>} Data terstruktur dari AI
   */
  async function parseWithModulePrompt(input, moduleId) {
    try {
      // Ambil prompt spesifik modul dari config
      const modulePrompts = window.YWMAIConfig ? window.YWMAIConfig.MODULE_PROMPTS : null;
      const modulePrompt = modulePrompts ? modulePrompts[moduleId] : null;

      const model = window.YWMAIConfig ? window.YWMAIConfig.getOptimalModel('smart_input_parsing') : 'gpt-4o-mini';

      let prompt;
      if (modulePrompt) {
        prompt = `${modulePrompt}

Input user: "${input}"`;
      } else {
        // Fallback prompt jika konfigurasi tidak tersedia
        prompt = `Parse input berikut menjadi JSON terstruktur untuk modul "${moduleId}" dari PT Yoga Wibawa Mandiri (perusahaan pengantongan semen).

Input: "${input}"

Output dalam format JSON:
{
  "module": "${moduleId}",
  "action": "tipe_aksi",
  "data": { ... data terstruktur ... }
}

WAJIB output JSON saja, tanpa penjelasan.`;
      }

      const response = await callAI(model, prompt);
      
      // Parse respons JSON
      try {
        const parsed = extractJSON(response);
        return parsed;
      } catch (parseError) {
        console.warn('[Smart Input] Gagal parse JSON dari AI:', parseError.message);
        
        // Return data dasar jika parsing gagal
        return {
          module: moduleId,
          action: 'input',
          data: {
            raw_input: input,
            parse_error: true
          }
        };
      }

    } catch (error) {
      console.error('[Smart Input] Gagal parsing dengan prompt modul:', error);
      return {
        module: moduleId,
        action: 'input',
        data: {
          raw_input: input,
          parse_error: true,
          error: error.message
        }
      };
    }
  }

  // ============================================================
  // VALIDASI DAN PERBAIKAN DATA
  // ============================================================

  /**
   * Memvalidasi dan memperbaiki data hasil parsing
   * @param {Object} data - Data hasil parsing AI
   * @param {string} moduleId - ID modul
   * @returns {Object} Data yang sudah divalidasi
   */
  function validateAndFix(data, moduleId) {
    if (!data) {
      return { module: moduleId, action: 'input', data: {} };
    }

    // Pastikan module ada dan sesuai
    if (!data.module) {
      data.module = moduleId;
    }

    // Pastikan action ada
    if (!data.action) {
      data.action = 'input';
    }

    // Pastikan data object ada
    if (!data.data) {
      // Mungkin data langsung di level atas
      const { module, action, ...rest } = data;
      data.data = rest;
    }

    // Validasi spesifik per modul
    switch (moduleId) {
      case 'spare-parts':
        data.data = validateSparePartsData(data.data);
        break;
      case 'team':
        data.data = validateTeamData(data.data);
        break;
      case 'maintenance':
        data.data = validateMaintenanceData(data.data);
        break;
      case 'produksi':
        data.data = validateProduksiData(data.data);
        break;
      case 'keuangan':
        data.data = validateKeuanganData(data.data);
        break;
      case 'hse':
        data.data = validateHSEData(data.data);
        break;
      default:
        break;
    }

    return data;
  }

  /**
   * Validasi data spare parts
   */
  function validateSparePartsData(data) {
    // Normalisasi nama field
    if (data.nama && !data.nama_part) data.nama_part = data.nama;
    if (data.jumlah && typeof data.jumlah === 'string') {
      data.jumlah = parseInt(data.jumlah.replace(/\D/g, '')) || 0;
    }
    if (data.harga && typeof data.harga === 'string') {
      data.harga = parseRupiah(data.harga);
    }
    if (data.harga_satuan && typeof data.harga_satuan === 'string') {
      data.harga_satuan = parseRupiah(data.harga_satuan);
    }
    // Normalisasi tipe transaksi
    if (data.tipe_transaksi) {
      data.tipe_transaksi = data.tipe_transaksi.toLowerCase();
    }
    return data;
  }

  /**
   * Validasi data kegiatan tim
   */
  function validateTeamData(data) {
    if (data.shift) {
      data.shift = data.shift.toLowerCase();
    }
    if (data.downtime_menit && typeof data.downtime_menit === 'string') {
      data.downtime_menit = parseInt(data.downtime_menit) || 0;
    }
    return data;
  }

  /**
   * Validasi data maintenance
   */
  function validateMaintenanceData(data) {
    if (data.tipe_maintenance) {
      data.tipe_maintenance = data.tipe_maintenance.toLowerCase();
    }
    if (data.prioritas) {
      data.prioritas = data.prioritas.toLowerCase();
    }
    if (data.biaya_material && typeof data.biaya_material === 'string') {
      data.biaya_material = parseRupiah(data.biaya_material);
    }
    return data;
  }

  /**
   * Validasi data produksi
   */
  function validateProduksiData(data) {
    if (data.shift) {
      data.shift = data.shift.toLowerCase();
    }
    if (data.realisasi_zak && typeof data.realisasi_zak === 'string') {
      data.realisasi_zak = parseInt(data.realisasi_zak.replace(/\D/g, '')) || 0;
    }
    if (data.target_zak && typeof data.target_zak === 'string') {
      data.target_zak = parseInt(data.target_zak.replace(/\D/g, '')) || 0;
    }
    if (data.downtime_menit && typeof data.downtime_menit === 'string') {
      data.downtime_menit = parseInt(data.downtime_menit) || 0;
    }
    return data;
  }

  /**
   * Validasi data keuangan
   */
  function validateKeuanganData(data) {
    if (data.jumlah && typeof data.jumlah === 'string') {
      data.jumlah = parseRupiah(data.jumlah);
    }
    if (data.tipe) {
      data.tipe = data.tipe.toLowerCase();
    }
    return data;
  }

  /**
   * Validasi data HSE
   */
  function validateHSEData(data) {
    if (data.severity) {
      data.severity = data.severity.toLowerCase();
    }
    if (data.tipe) {
      data.tipe = data.tipe.toLowerCase().replace(' ', '_');
    }
    return data;
  }

  // ============================================================
  // PENYIMPANAN KE MODUL
  // ============================================================

  /**
   * Menyimpan data terstruktur ke modul yang sesuai via puter.kv
   * @param {string} moduleId - ID modul target
   * @param {Object} data - Data terstruktur untuk disimpan
   * @returns {Promise<Object>} Hasil penyimpanan
   */
  async function saveToModule(moduleId, data) {
    try {
      const keys = getKVKeys();
      const moduleKey = keys.moduleData ? keys.moduleData[moduleId] : `ywm_${moduleId}`;

      if (!moduleKey) {
        console.warn(`[Smart Input] Modul tidak dikenal: ${moduleId}`);
        return { success: false, error: 'Modul tidak dikenal' };
      }

      const record = {
        ...data,
        id: generateId(),
        timestamp: new Date().toISOString(),
        source: 'smart_input'
      };

      if (typeof puter !== 'undefined' && puter.kv) {
        // Ambil data existing di modul
        let existingData = [];
        try {
          const stored = await puter.kv.get(moduleKey);
          if (stored) {
            existingData = JSON.parse(stored);
            if (!Array.isArray(existingData)) {
              existingData = [existingData];
            }
          }
        } catch (e) {
          // Data belum ada, buat array baru
          existingData = [];
        }

        // Tambahkan record baru
        existingData.push(record);

        // Batasi maksimal 500 record per modul di KV
        if (existingData.length > 500) {
          existingData = existingData.slice(-500);
        }

        // Simpan kembali ke KV
        await puter.kv.set(moduleKey, JSON.stringify(existingData));

        console.log(`[Smart Input] Data disimpan ke modul ${moduleId} (${moduleKey})`);
        return { success: true, module: moduleId, recordId: record.id, totalRecords: existingData.length };
      }

      return { success: false, error: 'puter.kv tidak tersedia' };

    } catch (error) {
      console.error(`[Smart Input] Gagal menyimpan ke modul ${moduleId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mengambil data dari modul tertentu
   * @param {string} moduleId - ID modul
   * @param {Object} filters - Filter opsional { dateFrom, dateTo, status, ... }
   * @returns {Promise<Array>} Data modul
   */
  async function getModuleData(moduleId, filters = {}) {
    try {
      const keys = getKVKeys();
      const moduleKey = keys.moduleData ? keys.moduleData[moduleId] : `ywm_${moduleId}`;

      if (typeof puter === 'undefined' || !puter.kv) {
        return [];
      }

      const stored = await puter.kv.get(moduleKey);
      if (!stored) return [];

      let data = JSON.parse(stored);
      if (!Array.isArray(data)) {
        data = [data];
      }

      // Terapkan filter jika ada
      if (filters.dateFrom || filters.dateTo) {
        data = data.filter(item => {
          const itemDate = item.timestamp ? new Date(item.timestamp) : null;
          if (!itemDate) return true;
          
          if (filters.dateFrom && itemDate < new Date(filters.dateFrom)) return false;
          if (filters.dateTo && itemDate > new Date(filters.dateTo)) return false;
          
          return true;
        });
      }

      if (filters.status) {
        data = data.filter(item => {
          const itemStatus = item.data?.status || item.status;
          return itemStatus === filters.status;
        });
      }

      if (filters.limit && filters.limit > 0) {
        data = data.slice(-filters.limit);
      }

      return data.reverse(); // Terbaru di atas

    } catch (error) {
      console.warn(`[Smart Input] Gagal mengambil data modul ${moduleId}:`, error.message);
      return [];
    }
  }

  /**
   * Mengambil data dari semua modul untuk ringkasan
   * @returns {Promise<Object>} Data ringkasan semua modul
   */
  async function getAllModuleSummary() {
    const modules = ['spare-parts', 'team', 'maintenance', 'produksi', 'keuangan', 'hse', 'hr', 'purchasing', 'distribusi'];
    const summary = {};

    for (const moduleId of modules) {
      try {
        const data = await getModuleData(moduleId);
        summary[moduleId] = {
          totalRecords: data.length,
          lastUpdate: data.length > 0 ? data[0].timestamp : null,
          latestRecords: data.slice(0, 3) // 3 record terbaru
        };
      } catch (e) {
        summary[moduleId] = { totalRecords: 0, lastUpdate: null, latestRecords: [] };
      }
    }

    return summary;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Parse string Rupiah ke angka
   * @param {string} str - String seperti "2.5 juta" atau "150rb" atau "150000"
   * @returns {number} Angka
   */
  function parseRupiah(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;

    let numStr = str.toLowerCase().replace(/rp\.?\s*/g, '').trim();

    // Handle "juta"
    if (numStr.includes('juta')) {
      const val = parseFloat(numStr.replace('juta', '').replace(/[.,]/g, m => m === '.' ? '' : '.'));
      return Math.round(val * 1000000);
    }

    // Handle "rb" / "ribu"
    if (numStr.includes('rb') || numStr.includes('ribu')) {
      const val = parseFloat(numStr.replace(/rb|ribu/g, '').replace(/[.,]/g, m => m === '.' ? '' : '.'));
      return Math.round(val * 1000);
    }

    // Handle format Indonesia: 1.500.000
    numStr = numStr.replace(/\./g, '').replace(/,/g, '.');

    return parseFloat(numStr) || 0;
  }

  /**
   * Generate ID unik sederhana
   * @returns {string} ID unik
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

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
   * Mengekstrak JSON dari respons AI
   * @param {string} response - Respons AI
   * @returns {Object} Parsed JSON
   */
  function extractJSON(response) {
    if (!response) throw new Error('Respons kosong');
    
    if (typeof response === 'object') return response;

    let text = typeof response === 'string' ? response : response.toString();

    // Coba parse langsung
    try {
      return JSON.parse(text);
    } catch (e) { /* lanjut */ }

    // Coba ekstrak dari code block
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim());
      } catch (e) { /* lanjut */ }
    }

    // Coba cari object JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) { /* lanjut */ }
    }

    throw new Error('Tidak dapat mengekstrak JSON dari respons AI');
  }

  // ============================================================
  // QUICK INPUT TEMPLATES
  // ============================================================

  /**
   * Template input cepat untuk common tasks
   * Berguna untuk UI quick action buttons
   */
  const QUICK_TEMPLATES = [
    {
      id: 'spare_masuk',
      label: '📦 Spare Part Masuk',
      template: 'Spare part {nama} masuk {jumlah} {satuan} dari supplier {supplier}, lokasi {lokasi}',
      module: 'spare-parts',
      fields: ['nama', 'jumlah', 'satuan', 'supplier', 'lokasi']
    },
    {
      id: 'spare_keluar',
      label: '📤 Spare Part Keluar',
      template: 'Spare part {nama} keluar {jumlah} {satuan} untuk {keperluan}',
      module: 'spare-parts',
      fields: ['nama', 'jumlah', 'satuan', 'keperluan']
    },
    {
      id: 'kegiatan_tim',
      label: '👥 Laporan Kegiatan',
      template: 'Tim {tim} shift {shift} {kegiatan}, status {status}',
      module: 'team',
      fields: ['tim', 'shift', 'kegiatan', 'status']
    },
    {
      id: 'maintenance_jadwal',
      label: '🔧 Jadwal Maintenance',
      template: 'Jadwal maintenance {item} {waktu}, tipe {tipe}',
      module: 'maintenance',
      fields: ['item', 'waktu', 'tipe']
    },
    {
      id: 'produksi_input',
      label: '📊 Input Produksi',
      template: 'Produksi shift {shift} {realisasi} zak, target {target} zak',
      module: 'produksi',
      fields: ['shift', 'realisasi', 'target']
    },
    {
      id: 'insiden_hse',
      label: '⚠️ Laporan Insiden',
      template: 'Insiden {tipe} di {lokasi}, {deskripsi}',
      module: 'hse',
      fields: ['tipe', 'lokasi', 'deskripsi']
    }
  ];

  /**
   * Mengisi template input cepat dengan data user
   * @param {string} templateId - ID template
   * @param {Object} values - Nilai untuk placeholder
   * @returns {string} Input yang sudah diisi
   */
  function fillTemplate(templateId, values) {
    const template = QUICK_TEMPLATES.find(t => t.id === templateId);
    if (!template) return '';

    let filled = template.template;
    for (const [key, value] of Object.entries(values)) {
      filled = filled.replace(`{${key}}`, value || `[${key}]`);
    }
    return filled;
  }

  // ============================================================
  // CALLBACK REGISTRATION
  // ============================================================

  function on(event, callback) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = callback;
    } else {
      console.warn(`[Smart Input] Event tidak dikenal: ${event}`);
    }
  }

  function off(event) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = null;
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  const SmartInput = {
    /**
     * Proses input bahasa natural menjadi data terstruktur dan simpan
     * @param {string} input - Input bahasa natural
     * @param {string} forceModule - Opsional: paksa modul tertentu
     * @returns {Promise<Object|null>} Hasil { module, action, data, confidence }
     */
    processInput: processInput,

    /**
     * Deteksi modul dari input (tanpa parsing)
     * @param {string} input - Input bahasa natural
     * @returns {Promise<string>} ID modul
     */
    detectModule: detectModule,

    /**
     * Simpan data ke modul tertentu
     * @param {string} moduleId - ID modul
     * @param {Object} data - Data terstruktur
     * @returns {Promise<Object>} Hasil penyimpanan
     */
    saveToModule: saveToModule,

    /**
     * Ambil data dari modul
     * @param {string} moduleId - ID modul
     * @param {Object} filters - Filter opsional
     * @returns {Promise<Array>}
     */
    getModuleData: getModuleData,

    /**
     * Ambil ringkasan semua modul
     * @returns {Promise<Object>}
     */
    getAllModuleSummary: getAllModuleSummary,

    /**
     * Cek apakah sedang memproses
     * @returns {boolean}
     */
    isProcessing: () => state.isProcessing,

    /**
     * Dapatkan hasil parsing terakhir
     * @returns {Object|null}
     */
    getLastResult: () => state.lastResult,

    /**
     * Dapatkan template input cepat
     * @returns {Array} Daftar template
     */
    getQuickTemplates: () => [...QUICK_TEMPLATES],

    /**
     * Isi template input cepat dengan data
     * @param {string} templateId - ID template
     * @param {Object} values - Nilai placeholder
     * @returns {string} Template yang sudah diisi
     */
    fillTemplate: fillTemplate,

    /**
     * Parse string Rupiah ke angka
     * @param {string} str - String Rupiah
     * @returns {number}
     */
    parseRupiah: parseRupiah,

    /**
     * Daftarkan callback
     * Event: processing_start, module_detected, parsing_complete, save_complete, error
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
  window.YWMSmartInput = SmartInput;

  console.log('[Smart Input] Modul smart input dimuat ✓');

})();
