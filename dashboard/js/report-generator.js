/**
 * ============================================================
 * Report Generator — Generasi Laporan AI untuk YWM Dashboard
 * ============================================================
 * 
 * Modul ini menangani:
 * - Generate laporan harian/mingguan/bulanan dari data di KV store
 * - AI merangkum data menjadi laporan yang mudah dibaca
 * - Tipe laporan:
 *   - Stok spare parts (stok saat ini, peringatan stok rendah, rekomendasi)
 *   - Kegiatan tim (ringkasan kegiatan per shift/hari)
 *   - Maintenance (jadwal mendatang, selesai, terlambat)
 *   - Produksi (output vs target, metrik efisiensi)
 *   - Keuangan (ringkasan cashflow, kategori pengeluaran)
 *   - Safety (insiden, near miss, kepatuhan)
 * - Export laporan sebagai teks atau simpan ke puter.fs
 * - Insight dan rekomendasi bertenaga AI
 * 
 * Dependensi: ai-config.js, smart-input.js (untuk ambil data modul)
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
    isGenerating: false,        // Sedang generate laporan
    lastReport: null,           // Laporan terakhir yang dihasilkan
    reportHistory: [],          // Riwayat laporan (in-memory)
    callbacks: {                // Callback functions
      onGeneratingStart: null,
      onDataCollected: null,
      onReportGenerated: null,
      onReportSaved: null,
      onError: null,
      onProgress: null
    }
  };

  // ============================================================
  // KONFIGURASI
  // ============================================================

  function getConfig() {
    if (window.YWMAIConfig && window.YWMAIConfig.REPORT_CONFIG) {
      return window.YWMAIConfig.REPORT_CONFIG;
    }
    return {
      types: [
        { id: 'stok_spare_parts', label: 'Stok Spare Parts', module: 'spare-parts', icon: '📦' },
        { id: 'kegiatan_tim', label: 'Kegiatan Tim', module: 'team', icon: '👥' },
        { id: 'maintenance', label: 'Maintenance', module: 'maintenance', icon: '🔧' },
        { id: 'produksi', label: 'Produksi', module: 'produksi', icon: '📊' },
        { id: 'keuangan', label: 'Keuangan', module: 'keuangan', icon: '💰' },
        { id: 'safety', label: 'Safety & HSE', module: 'hse', icon: '⚠️' },
        { id: 'hr', label: 'HR & Karyawan', module: 'hr', icon: '🧑‍💼' },
        { id: 'purchasing', label: 'Purchasing', module: 'purchasing', icon: '🛒' },
        { id: 'distribusi', label: 'Distribusi', module: 'distribusi', icon: '🚛' }
      ],
      periods: [
        { id: 'harian', label: 'Harian' },
        { id: 'mingguan', label: 'Mingguan' },
        { id: 'bulanan', label: 'Bulanan' }
      ],
      exportFormats: ['text', 'json'],
      saveToFS: true,
      fsPath: '/ywm-reports/',
      modelForReport: 'claude-3.5-sonnet'
    };
  }

  function getKVKeys() {
    if (window.YWMAIConfig && window.YWMAIConfig.KV_KEYS) {
      return window.YWMAIConfig.KV_KEYS;
    }
    return { reportCache: 'ywm_report_' };
  }

  // ============================================================
  // GENERATE LAPORAN UTAMA
  // ============================================================

  /**
   * Generate laporan untuk modul dan periode tertentu
   * @param {string} reportType - Tipe laporan (id dari REPORT_CONFIG.types)
   * @param {string} period - Periode: harian, mingguan, bulanan
   * @param {Object} options - Opsi tambahan { dateFrom, dateTo, includeInsights }
   * @returns {Promise<Object|null>} Laporan yang dihasilkan
   */
  async function generateReport(reportType, period = 'harian', options = {}) {
    const config = getConfig();

    // Cari konfigurasi tipe laporan
    const reportConfig = config.types.find(t => t.id === reportType);
    if (!reportConfig) {
      console.error('[Report Generator] Tipe laporan tidak dikenal:', reportType);
      if (state.callbacks.onError) {
        state.callbacks.onError({
          type: 'invalid_report_type',
          message: `Tipe laporan "${reportType}" tidak valid.`
        });
      }
      return null;
    }

    state.isGenerating = true;

    // Callback: mulai generate
    if (state.callbacks.onGeneratingStart) {
      state.callbacks.onGeneratingStart({ type: reportType, period });
    }
    if (state.callbacks.onProgress) {
      state.callbacks.onProgress({ step: 'initializing', percent: 5 });
    }

    try {
      // ========================================
      // LANGKAH 1: Tentukan rentang tanggal
      // ========================================
      const dateRange = calculateDateRange(period, options);
      
      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'date_range', percent: 10 });
      }

      // ========================================
      // LANGKAH 2: Kumpulkan data dari modul
      // ========================================
      const moduleData = await collectModuleData(reportConfig.module, dateRange);
      
      if (state.callbacks.onDataCollected) {
        state.callbacks.onDataCollected({ module: reportConfig.module, recordCount: moduleData.length });
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'data_collected', percent: 40 });
      }

      // ========================================
      // LANGKAH 3: Hitung statistik dasar
      // ========================================
      const statistics = calculateStatistics(reportConfig.module, moduleData);
      
      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'statistics', percent: 55 });
      }

      // ========================================
      // LANGKAH 4: Generate laporan dengan AI
      // ========================================
      const aiReport = await generateAIReport(
        reportConfig.module,
        period,
        moduleData,
        statistics,
        dateRange,
        options.includeInsights !== false
      );

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'ai_report', percent: 85 });
      }

      // ========================================
      // LANGKAH 5: Susun laporan final
      // ========================================
      const report = {
        id: generateId(),
        type: reportType,
        module: reportConfig.module,
        label: reportConfig.label,
        icon: reportConfig.icon,
        period: period,
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        statistics: statistics,
        data: moduleData,
        report: aiReport.text,
        insights: aiReport.insights,
        recommendations: aiReport.recommendations,
        recordCount: moduleData.length
      };

      // ========================================
      // LANGKAH 6: Simpan laporan
      // ========================================
      await saveReportToKV(report);
      
      if (config.saveToFS) {
        await saveReportToFS(report);
      }

      if (state.callbacks.onReportSaved) {
        state.callbacks.onReportSaved({ reportId: report.id });
      }

      if (state.callbacks.onProgress) {
        state.callbacks.onProgress({ step: 'complete', percent: 100 });
      }

      // Simpan ke state
      state.lastReport = report;
      state.reportHistory.push({
        id: report.id,
        type: reportType,
        module: reportConfig.module,
        period: period,
        generatedAt: report.generatedAt,
        preview: report.report?.substring(0, 100)
      });

      // Batasi riwayat
      if (state.reportHistory.length > 30) {
        state.reportHistory = state.reportHistory.slice(-30);
      }

      // Callback: laporan selesai
      if (state.callbacks.onReportGenerated) {
        state.callbacks.onReportGenerated(report);
      }

      console.log(`[Report Generator] Laporan ${reportType} (${period}) berhasil dibuat`);
      return report;

    } catch (error) {
      console.error('[Report Generator] Gagal membuat laporan:', error);

      if (state.callbacks.onError) {
        const getErrMsg = window.YWMAIConfig?.getErrorMessage;
        const errorMessage = getErrMsg ? getErrMsg('generic') : 'Gagal membuat laporan. Silakan coba lagi.';
        state.callbacks.onError({
          type: 'generation_failed',
          message: errorMessage,
          originalError: error.message
        });
      }

      return null;

    } finally {
      state.isGenerating = false;
    }
  }

  // ============================================================
  // PENGUMPULAN DATA
  // ============================================================

  /**
   * Menghitung rentang tanggal berdasarkan periode
   * @param {string} period - Periode: harian, mingguan, bulanan
   * @param {Object} options - Opsi tambahan { dateFrom, dateTo }
   * @returns {Object} { dateFrom, dateTo, label }
   */
  function calculateDateRange(period, options = {}) {
    const now = new Date();
    
    // Jika tanggal sudah ditentukan manual
    if (options.dateFrom && options.dateTo) {
      return {
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        label: `${options.dateFrom} s/d ${options.dateTo}`
      };
    }

    let dateFrom, dateTo, label;

    switch (period) {
      case 'harian':
        dateFrom = formatDate(now);
        dateTo = formatDate(now);
        label = `Hari ini (${formatDate(now)})`;
        break;

      case 'mingguan':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Minggu
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sabtu
        dateFrom = formatDate(weekStart);
        dateTo = formatDate(weekEnd);
        label = `Minggu ini (${dateFrom} s/d ${dateTo})`;
        break;

      case 'bulanan':
        dateFrom = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        dateTo = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        label = `Bulan ini (${dateFrom} s/d ${dateTo})`;
        break;

      default:
        dateFrom = formatDate(now);
        dateTo = formatDate(now);
        label = `${dateFrom}`;
    }

    return { dateFrom, dateTo, label };
  }

  /**
   * Format Date ke string YYYY-MM-DD
   * @param {Date} date - Objek Date
   * @returns {string} Format YYYY-MM-DD
   */
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Mengumpulkan data dari modul tertentu
   * @param {string} moduleId - ID modul
   * @param {Object} dateRange - Rentang tanggal { dateFrom, dateTo }
   * @returns {Promise<Array>} Data modul dalam rentang tanggal
   */
  async function collectModuleData(moduleId, dateRange) {
    // Gunakan smart-input untuk ambil data
    if (window.YWMSmartInput && window.YWMSmartInput.getModuleData) {
      try {
        const data = await window.YWMSmartInput.getModuleData(moduleId, {
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          limit: 200
        });
        return data || [];
      } catch (error) {
        console.warn('[Report Generator] Gagal ambil data via smart-input:', error.message);
      }
    }

    // Fallback: ambil langsung dari puter.kv
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

      // Filter berdasarkan tanggal
      return data.filter(item => {
        const itemDate = item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : null;
        if (!itemDate) return false;
        return itemDate >= dateRange.dateFrom && itemDate <= dateRange.dateTo;
      });

    } catch (error) {
      console.warn(`[Report Generator] Gagal ambil data modul ${moduleId}:`, error.message);
      return [];
    }
  }

  // ============================================================
  // STATISTIK DASAR
  // ============================================================

  /**
   * Menghitung statistik dasar dari data modul
   * @param {string} moduleId - ID modul
   * @param {Array} data - Data modul
   * @returns {Object} Statistik dasar
   */
  function calculateStatistics(moduleId, data) {
    const stats = {
      totalRecords: data.length,
      period: {}
    };

    if (data.length === 0) {
      return stats;
    }

    switch (moduleId) {
      case 'spare-parts':
        stats.period = {
          totalMasuk: data.filter(d => d.data?.tipe_transaksi === 'masuk').length,
          totalKeluar: data.filter(d => d.data?.tipe_transaksi === 'keluar').length,
          totalOrder: data.filter(d => d.data?.tipe_transaksi === 'pemesanan').length
        };
        break;

      case 'team':
        stats.period = {
          totalKegiatan: data.length,
          perShift: {
            pagi: data.filter(d => d.data?.shift === 'pagi').length,
            siang: data.filter(d => d.data?.shift === 'siang').length,
            malam: data.filter(d => d.data?.shift === 'malam').length
          },
          perStatus: {
            selesai: data.filter(d => d.data?.status === 'selesai').length,
            berlangsung: data.filter(d => d.data?.status === 'berlangsung').length,
            dijadwalkan: data.filter(d => d.data?.status === 'dijadwalkan').length
          }
        };
        break;

      case 'maintenance':
        stats.period = {
          totalWO: data.length,
          perStatus: {
            dibuat: data.filter(d => d.data?.status === 'dibuat').length,
            dijadwalkan: data.filter(d => d.data?.status === 'dijadwalkan').length,
            berlangsung: data.filter(d => d.data?.status === 'berlangsung').length,
            selesai: data.filter(d => d.data?.status === 'selesai').length
          },
          perTipe: {
            preventive: data.filter(d => d.data?.tipe_maintenance === 'preventive').length,
            corrective: data.filter(d => d.data?.tipe_maintenance === 'corrective').length,
            emergency: data.filter(d => d.data?.tipe_maintenance === 'emergency').length
          }
        };
        break;

      case 'produksi':
        const totalZak = data.reduce((sum, d) => sum + (d.data?.realisasi_zak || 0), 0);
        const totalTarget = data.reduce((sum, d) => sum + (d.data?.target_zak || 0), 0);
        stats.period = {
          totalShift: data.length,
          totalRealisasiZak: totalZak,
          totalTargetZak: totalTarget,
          pencapaianPersen: totalTarget > 0 ? ((totalZak / totalTarget) * 100).toFixed(1) : 0
        };
        break;

      case 'keuangan':
        const totalPemasukan = data
          .filter(d => d.data?.tipe === 'pemasukan')
          .reduce((sum, d) => sum + (d.data?.jumlah || 0), 0);
        const totalPengeluaran = data
          .filter(d => d.data?.tipe === 'pengeluaran')
          .reduce((sum, d) => sum + (d.data?.jumlah || 0), 0);
        stats.period = {
          totalPemasukan,
          totalPengeluaran,
          saldo: totalPemasukan - totalPengeluaran
        };
        break;

      case 'hse':
        stats.period = {
          totalInsiden: data.filter(d => d.data?.tipe === 'insiden').length,
          totalNearMiss: data.filter(d => d.data?.tipe === 'near_miss').length,
          perSeverity: {
            critical: data.filter(d => d.data?.severity === 'critical').length,
            high: data.filter(d => d.data?.severity === 'high').length,
            medium: data.filter(d => d.data?.severity === 'medium').length,
            low: data.filter(d => d.data?.severity === 'low').length
          }
        };
        break;

      default:
        stats.period = {
          totalRecords: data.length
        };
    }

    return stats;
  }

  // ============================================================
  // GENERATE LAPORAN AI
  // ============================================================

  /**
   * Menghasilkan laporan menggunakan AI
   * @param {string} moduleId - ID modul
   * @param {string} period - Periode laporan
   * @param {Array} data - Data modul
   * @param {Object} statistics - Statistik dasar
   * @param {Object} dateRange - Rentang tanggal
   * @param {boolean} includeInsights - Sertakan insight dan rekomendasi
   * @returns {Promise<Object>} { text, insights, recommendations }
   */
  async function generateAIReport(moduleId, period, data, statistics, dateRange, includeInsights) {
    const config = getConfig();
    const model = config.modelForReport || 'claude-3.5-sonnet';

    // Ambil prompt laporan dari ai-config
    const reportPrompt = window.YWMAIConfig ? window.YWMAIConfig.getReportPrompt(moduleId) : '';

    // Susun data untuk dikirim ke AI
    const dataSummary = data.length > 0 
      ? JSON.stringify(data.slice(0, 50), null, 2)  // Batasi 50 record teratas
      : 'Tidak ada data untuk periode ini.';

    const prompt = `${reportPrompt}

Periode: ${dateRange.label} (${dateRange.dateFrom} s/d ${dateRange.dateTo})

Statistik Dasar:
${JSON.stringify(statistics, null, 2)}

Data Detail (maks 50 record terbaru):
${dataSummary}

${includeInsights ? `
Selain laporan utama, berikan juga:
1. **Insight**: Temuan penting atau pola dari data (3-5 poin)
2. **Rekomendasi**: Saran tindakan berdasarkan data (3-5 poin)

Format output:
# LAPORAN [Jenis Laporan]
## Periode: [Rentang Tanggal]

### 1. Ringkasan
[Ringkasan eksekutif]

### 2. [Section sesuai prompt]
[Detail laporan]

### 3. Insight
- [Insight 1]
- [Insight 2]
- [Insight 3]

### 4. Rekomendasi
- [Rekomendasi 1]
- [Rekomendasi 2]
- [Rekomendasi 3]
` : 'Buat laporan langsung tanpa insight dan rekomendasi.'}

Gunakan Bahasa Indonesia yang formal dan profesional.`;

    try {
      const response = await callAI(model, prompt);

      // Parse respons
      const reportText = typeof response === 'string' ? response : response?.toString() || '';
      
      // Ekstrak insight dan rekomendasi
      const insights = [];
      const recommendations = [];

      if (includeInsights) {
        // Ekstrak insight dari laporan
        const insightMatch = reportText.match(/###\s*3\.\s*Insight\s*\n([\s\S]*?)(?=###\s*4\.|$)/i);
        if (insightMatch) {
          const lines = insightMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
          lines.forEach(l => insights.push(l.replace(/^-\s*/, '').trim()));
        }

        // Ekstrak rekomendasi dari laporan
        const recMatch = reportText.match(/###\s*4\.\s*Rekomendasi\s*\n([\s\S]*?)$/i);
        if (recMatch) {
          const lines = recMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
          lines.forEach(l => recommendations.push(l.replace(/^-\s*/, '').trim()));
        }
      }

      return {
        text: reportText,
        insights,
        recommendations
      };

    } catch (error) {
      console.error('[Report Generator] Gagal generate laporan AI:', error);
      
      // Fallback: buat laporan sederhana tanpa AI
      return generateFallbackReport(moduleId, period, statistics, dateRange);
    }
  }

  /**
   * Generate laporan sederhana tanpa AI (fallback)
   * @param {string} moduleId - ID modul
   * @param {string} period - Periode
   * @param {Object} statistics - Statistik
   * @param {Object} dateRange - Rentang tanggal
   * @returns {Object} { text, insights, recommendations }
   */
  function generateFallbackReport(moduleId, period, statistics, dateRange) {
    const moduleLabels = {
      'spare-parts': 'Stok Spare Parts',
      'team': 'Kegiatan Tim',
      'maintenance': 'Maintenance',
      'produksi': 'Produksi',
      'keuangan': 'Keuangan',
      'hse': 'Safety & HSE',
      'hr': 'HR & Karyawan',
      'purchasing': 'Purchasing',
      'distribusi': 'Distribusi'
    };

    const periodLabels = {
      'harian': 'Harian',
      'mingguan': 'Mingguan',
      'bulanan': 'Bulanan'
    };

    const label = moduleLabels[moduleId] || moduleId;
    const periodLabel = periodLabels[period] || period;

    const text = `# LAPORAN ${label.toUpperCase()}
## Periode: ${dateRange.label}

### 1. Ringkasan
Laporan ${periodLabel.toLowerCase()} untuk modul ${label}.
Periode: ${dateRange.dateFrom} s/d ${dateRange.dateTo}

### 2. Statistik
Total Record: ${statistics.totalRecords}

${statistics.period ? Object.entries(statistics.period).map(([key, value]) => {
  if (typeof value === 'object') {
    return `${key}:
${Object.entries(value).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}`;
  }
  return `- ${key}: ${value}`;
}).join('\n') : 'Tidak ada statistik tersedia.'}

*Catatan: Laporan ini dibuat tanpa bantuan AI karena keterbatasan layanan.*`;

    return {
      text,
      insights: ['Data terbatas — insight AI tidak tersedia saat ini'],
      recommendations: ['Aktifkan koneksi AI untuk mendapatkan insight dan rekomendasi otomatis']
    };
  }

  // ============================================================
  // GENERATE LAPORAN RINGKASAN (SEMUA MODUL)
  // ============================================================

  /**
   * Generate laporan ringkas dari semua modul
   * @param {string} period - Periode: harian, mingguan, bulanan
   * @returns {Promise<Object>} Ringkasan semua modul
   */
  async function generateSummaryReport(period = 'harian') {
    state.isGenerating = true;

    if (state.callbacks.onGeneratingStart) {
      state.callbacks.onGeneratingStart({ type: 'summary', period });
    }

    try {
      const config = getConfig();
      const dateRange = calculateDateRange(period);
      const summary = {};

      // Kumpulkan data dari setiap modul
      for (const reportType of config.types) {
        const data = await collectModuleData(reportType.module, dateRange);
        const stats = calculateStatistics(reportType.module, data);
        
        summary[reportType.module] = {
          label: reportType.label,
          icon: reportType.icon,
          ...stats
        };
      }

      // Generate ringkasan AI
      let summaryText = '';
      try {
        const model = config.modelForReport || 'gpt-4o-mini';
        const prompt = `Buat ringkasan eksekutif untuk semua modul operasional PT Yoga Wibawa Mandiri.

Periode: ${dateRange.label}

Data ringkasan per modul:
${JSON.stringify(summary, null, 2)}

Buat ringkasan singkat (3-5 kalimat per modul) dalam Bahasa Indonesia.
Akhiri dengan 3 rekomendasi prioritas utama.`;

        const response = await callAI(model, prompt);
        summaryText = typeof response === 'string' ? response : response?.toString() || '';
      } catch (error) {
        summaryText = 'Ringkasan AI tidak tersedia. Lihat statistik per modul di bawah.';
      }

      const report = {
        id: generateId(),
        type: 'summary',
        module: 'all',
        period: period,
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        summary: summary,
        report: summaryText,
        recordCount: Object.values(summary).reduce((sum, s) => sum + s.totalRecords, 0)
      };

      await saveReportToKV(report);

      state.lastReport = report;
      
      if (state.callbacks.onReportGenerated) {
        state.callbacks.onReportGenerated(report);
      }

      return report;

    } catch (error) {
      console.error('[Report Generator] Gagal membuat ringkasan:', error);

      if (state.callbacks.onError) {
        state.callbacks.onError({
          type: 'generation_failed',
          message: 'Gagal membuat laporan ringkasan.',
          originalError: error.message
        });
      }

      return null;

    } finally {
      state.isGenerating = false;
    }
  }

  // ============================================================
  // PENYIMPANAN LAPORAN
  // ============================================================

  /**
   * Simpan laporan ke puter.kv
   * @param {Object} report - Objek laporan
   */
  async function saveReportToKV(report) {
    try {
      const keys = getKVKeys();
      const key = `${keys.reportCache}${report.id}`;

      if (typeof puter !== 'undefined' && puter.kv) {
        await puter.kv.set(key, JSON.stringify(report));

        // Update index laporan
        const indexKey = `${keys.reportCache}index`;
        let index = [];
        try {
          const existingIndex = await puter.kv.get(indexKey);
          if (existingIndex) index = JSON.parse(existingIndex);
        } catch (e) { /* index belum ada */ }

        index.push({
          key,
          id: report.id,
          type: report.type,
          module: report.module,
          period: report.period,
          generatedAt: report.generatedAt
        });

        // Batasi 30 laporan di index
        if (index.length > 30) {
          index = index.slice(-30);
        }

        await puter.kv.set(indexKey, JSON.stringify(index));
        console.log('[Report Generator] Laporan disimpan di KV:', key);
      }
    } catch (error) {
      console.warn('[Report Generator] Gagal menyimpan laporan ke KV:', error.message);
    }
  }

  /**
   * Simpan laporan ke puter.fs sebagai file teks
   * @param {Object} report - Objek laporan
   */
  async function saveReportToFS(report) {
    try {
      const config = getConfig();
      const fileName = `laporan_${report.type}_${report.period}_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${config.fsPath}${fileName}`;

      if (typeof puter !== 'undefined' && puter.fs) {
        // Pastikan direktori ada
        try {
          await puter.fs.mkdir(config.fsPath);
        } catch (e) { /* direktori mungkin sudah ada */ }

        // Simpan file
        const content = typeof report.report === 'string' ? report.report : JSON.stringify(report.report, null, 2);
        await puter.fs.write(filePath, content);
        console.log('[Report Generator] Laporan disimpan di FS:', filePath);
        return filePath;
      }

      return null;
    } catch (error) {
      console.warn('[Report Generator] Gagal menyimpan laporan ke FS:', error.message);
      return null;
    }
  }

  // ============================================================
  // RIWAYAT LAPORAN
  // ============================================================

  /**
   * Mengambil riwayat laporan dari puter.kv
   * @param {number} limit - Batas jumlah
   * @returns {Promise<Array>} Daftar laporan
   */
  async function getReportHistory(limit = 10) {
    try {
      const keys = getKVKeys();
      const indexKey = `${keys.reportCache}index`;

      if (typeof puter === 'undefined' || !puter.kv) {
        return state.reportHistory.slice(-limit);
      }

      const indexStr = await puter.kv.get(indexKey);
      if (!indexStr) return state.reportHistory.slice(-limit);

      const index = JSON.parse(indexStr);
      return index.slice(-limit).reverse();

    } catch (error) {
      console.warn('[Report Generator] Gagal mengambil riwayat:', error.message);
      return state.reportHistory.slice(-limit);
    }
  }

  /**
   * Mengambil detail laporan dari puter.kv
   * @param {string} reportId - ID laporan
   * @returns {Promise<Object|null>} Detail laporan
   */
  async function getReportById(reportId) {
    try {
      const keys = getKVKeys();
      const key = `${keys.reportCache}${reportId}`;

      if (typeof puter === 'undefined' || !puter.kv) {
        return null;
      }

      const stored = await puter.kv.get(key);
      if (!stored) return null;

      return JSON.parse(stored);

    } catch (error) {
      console.warn('[Report Generator] Gagal mengambil laporan:', error.message);
      return null;
    }
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  async function callAI(model, prompt) {
    if (typeof puter === 'undefined' || !puter.ai) {
      throw new Error('puter.ai tidak tersedia');
    }

    if (window.YWMAIConfig && window.YWMAIConfig.callWithFallback) {
      return await window.YWMAIConfig.callWithFallback(
        (m) => puter.ai.chat(prompt, { model: m }),
        model
      );
    }

    const response = await puter.ai.chat(prompt, { model });
    return typeof response === 'string' ? response : response?.message?.content || response?.toString() || '';
  }

  // ============================================================
  // CALLBACK REGISTRATION
  // ============================================================

  function on(event, callback) {
    const callbackKey = `on${event.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    if (state.callbacks.hasOwnProperty(callbackKey)) {
      state.callbacks[callbackKey] = callback;
    } else {
      console.warn(`[Report Generator] Event tidak dikenal: ${event}`);
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

  const ReportGenerator = {
    /**
     * Generate laporan untuk modul dan periode tertentu
     * @param {string} reportType - Tipe laporan (stok_spare_parts, kegiatan_tim, dll)
     * @param {string} period - Periode: harian, mingguan, bulanan
     * @param {Object} options - { dateFrom, dateTo, includeInsights }
     * @returns {Promise<Object|null>}
     */
    generate: generateReport,

    /**
     * Generate ringkasan semua modul
     * @param {string} period - Periode
     * @returns {Promise<Object|null>}
     */
    generateSummary: generateSummaryReport,

    /**
     * Ambil riwayat laporan
     * @param {number} limit - Batas jumlah
     * @returns {Promise<Array>}
     */
    getHistory: getReportHistory,

    /**
     * Ambil detail laporan berdasarkan ID
     * @param {string} reportId - ID laporan
     * @returns {Promise<Object|null>}
     */
    getById: getReportById,

    /**
     * Ambil konfigurasi tipe laporan yang tersedia
     * @returns {Array} Daftar tipe laporan
     */
    getAvailableTypes: () => getConfig().types,

    /**
     * Ambil periode laporan yang tersedia
     * @returns {Array} Daftar periode
     */
    getAvailablePeriods: () => getConfig().periods,

    /**
     * Cek apakah sedang generate laporan
     * @returns {boolean}
     */
    isGenerating: () => state.isGenerating,

    /**
     * Ambil laporan terakhir yang dihasilkan
     * @returns {Object|null}
     */
    getLastReport: () => state.lastReport,

    /**
     * Daftarkan callback
     * Event: generating_start, data_collected, report_generated, report_saved, error, progress
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
  window.YWMReportGenerator = ReportGenerator;

  console.log('[Report Generator] Modul report generator dimuat ✓');

})();
