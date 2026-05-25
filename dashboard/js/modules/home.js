/**
 * YWM Dashboard — Home / Beranda Module
 * PT Yoga Wibawa Mandiri
 *
 * KPI overview cards, quick status grid, quick actions, and alerts.
 */
window.YWM = window.YWM || {};
window.YWM.Modules = window.YWM.Modules || {};

(function () {
    'use strict';

    /* ───────────────────────── helpers ───────────────────────── */

    /** Format a Date to Indonesian locale string, e.g. "Senin, 3 Maret 2025" */
    function formatDateID(date) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    }

    /** Return YYYY-MM-DD string for a Date */
    function toISODate(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + dd;
    }

    /** Greeting based on hour */
    function greeting(hour) {
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }

    /** Safely read from YWM.Data; returns fallback on any failure */
    function getData(key, fallback) {
        try {
            var val = YWM.Data.get(key);
            return val != null ? val : fallback;
        } catch (e) {
            return fallback;
        }
    }

    /** SVG icon helper — returns an inline SVG string */
    function icon(name, size) {
        size = size || 18;
        var s = {
            'factory': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V8l4-4v4l4-4v4l4-4v12"/><path d="M18 12V8l4-4v16H2"/><rect x="6" y="14" width="2" height="3"/><rect x="10" y="14" width="2" height="3"/><rect x="14" y="14" width="2" height="3"/></svg>',
            'wrench': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
            'alert-triangle': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            'shield': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            'dollar-sign': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            'users': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
            'trending-down': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
            'box': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
            'truck': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
            'activity': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
            'clipboard': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
            'scan': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>',
            'plus-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
            'bell': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
            'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
            'bar-chart': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
            'clock': '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        };
        return s[name] || '';
    }

    /* ───────────────────── data collectors ───────────────────── */

    function collectKPIs() {
        var now = new Date();
        var todayKey = toISODate(now);
        var monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

        // --- Produksi Hari Ini ---
        var prodData = getData('ywm:production:daily:' + todayKey, {});
        var bagsProduced = 0;
        var prodTrend = 0;
        try {
            if (Array.isArray(prodData.entries)) {
                prodData.entries.forEach(function (e) { bagsProduced += Number(e.qty) || 0; });
            } else if (typeof prodData.totalBags === 'number') {
                bagsProduced = prodData.totalBags;
            }
            prodTrend = prodData.trend || 0;
        } catch (_) { /* keep defaults */ }

        // --- Work Order Aktif ---
        var woIndex = getData('ywm:maintenance:index:all', []);
        var activeWOs = 0;
        var woTrend = 0;
        try {
            if (Array.isArray(woIndex)) {
                activeWOs = woIndex.filter(function (w) {
                    return w.status === 'open' || w.status === 'in-progress';
                }).length;
            }
            woTrend = getData('ywm:maintenance:wo:trend', 0);
        } catch (_) { /* keep defaults */ }

        // --- Stok Spare Part Rendah ---
        var spIndex = getData('ywm:sparepart:index:all', []);
        var lowStock = 0;
        var spTrend = 0;
        try {
            if (Array.isArray(spIndex)) {
                lowStock = spIndex.filter(function (s) {
                    return Number(s.onHand) <= Number(s.reorderPoint);
                }).length;
            }
            spTrend = getData('ywm:sparepart:low:trend', 0);
        } catch (_) { /* keep defaults */ }

        // --- Insiden HSE Bulan Ini ---
        var hseCount = 0;
        var hseTrend = 0;
        try {
            var hseData = getData('ywm:hse:incidents:' + monthKey, []);
            hseCount = Array.isArray(hseData) ? hseData.length : (hseData.count || 0);
            hseTrend = hseData.trend || 0;
        } catch (_) { /* keep defaults */ }

        // --- Transaksi Keuangan ---
        var finCount = 0;
        var finTrend = 0;
        try {
            var finData = getData('ywm:finance:transactions:' + monthKey, []);
            finCount = Array.isArray(finData) ? finData.length : (finData.count || 0);
            finTrend = finData.trend || 0;
        } catch (_) { /* keep defaults */ }

        // --- Tim Aktif ---
        var teamActive = 0;
        var teamTrend = 0;
        try {
            var teamData = getData('ywm:hr:attendance:' + todayKey, []);
            teamActive = Array.isArray(teamData)
                ? teamData.filter(function (t) { return t.checkedIn; }).length
                : (teamData.activeCount || 0);
            teamTrend = teamData.trend || 0;
        } catch (_) { /* keep defaults */ }

        return [
            {
                id: 'kpi-production',
                label: 'Produksi Hari Ini',
                value: bagsProduced,
                unit: 'karung',
                icon: 'factory',
                trend: prodTrend,
                color: '#00d4ff'
            },
            {
                id: 'kpi-wo',
                label: 'Work Order Aktif',
                value: activeWOs,
                unit: 'WO',
                icon: 'wrench',
                trend: woTrend,
                color: '#ffab00'
            },
            {
                id: 'kpi-lowstock',
                label: 'Stok Spare Part Rendah',
                value: lowStock,
                unit: 'item',
                icon: 'alert-triangle',
                trend: spTrend,
                color: '#ff5252'
            },
            {
                id: 'kpi-hse',
                label: 'Insiden HSE Bulan Ini',
                value: hseCount,
                unit: 'insiden',
                icon: 'shield',
                trend: hseTrend,
                color: '#ff5252'
            },
            {
                id: 'kpi-finance',
                label: 'Transaksi Keuangan',
                value: finCount,
                unit: 'transaksi',
                icon: 'dollar-sign',
                trend: finTrend,
                color: '#00e676'
            },
            {
                id: 'kpi-team',
                label: 'Tim Aktif',
                value: teamActive,
                unit: 'orang',
                icon: 'users',
                trend: teamTrend,
                color: '#00d4ff'
            }
        ];
    }

    function collectProductionSummary() {
        var now = new Date();
        var todayKey = toISODate(now);
        var prodData = getData('ywm:production:daily:' + todayKey, {});

        var curah = 0, bagged = 0, shipped = 0;
        try {
            curah = prodData.curahReceived || prodData.curah || 0;
            bagged = prodData.bagged || prodData.totalBags || 0;
            shipped = prodData.shipped || prodData.shippedBags || 0;
        } catch (_) { /* keep defaults */ }

        return { curah: curah, bagged: bagged, shipped: shipped };
    }

    function collectRecentActivities() {
        var now = new Date();
        var todayKey = toISODate(now);
        var auditLog = getData('ywm:audit:log:' + todayKey, []);
        var activities = [];

        try {
            if (Array.isArray(auditLog)) {
                activities = auditLog.slice(0, 5).map(function (entry) {
                    return {
                        action: entry.action || entry.description || 'Aktivitas',
                        user: entry.user || entry.userName || 'Sistem',
                        time: entry.time || entry.timestamp || ''
                    };
                });
            }
        } catch (_) { /* keep defaults */ }

        // Fallback placeholder if no activities
        if (activities.length === 0) {
            activities = [
                { action: 'Belum ada aktivitas hari ini', user: '', time: '' }
            ];
        }

        return activities;
    }

    function collectAlerts() {
        var alerts = [];
        var now = new Date();
        var todayKey = toISODate(now);

        // Low stock alert
        try {
            var spIndex = getData('ywm:sparepart:index:all', []);
            var lowItems = Array.isArray(spIndex)
                ? spIndex.filter(function (s) { return Number(s.onHand) <= Number(s.reorderPoint); })
                : [];
            if (lowItems.length > 0) {
                alerts.push({
                    type: 'warning',
                    message: lowItems.length + ' spare part di bawah reorder point: ' +
                        lowItems.slice(0, 3).map(function (i) { return i.name || i.id; }).join(', ') +
                        (lowItems.length > 3 ? ' dan ' + (lowItems.length - 3) + ' lainnya' : '')
                });
            }
        } catch (_) { /* skip */ }

        // Overdue WO alert
        try {
            var woIndex = getData('ywm:maintenance:index:all', []);
            var overdue = Array.isArray(woIndex)
                ? woIndex.filter(function (w) {
                    return (w.status === 'open' || w.status === 'in-progress') &&
                        w.dueDate && new Date(w.dueDate) < now;
                })
                : [];
            if (overdue.length > 0) {
                alerts.push({
                    type: 'error',
                    message: overdue.length + ' work order terlambat dari jadwal'
                });
            }
        } catch (_) { /* skip */ }

        // Production anomaly alert
        try {
            var prodData = getData('ywm:production:daily:' + todayKey, {});
            if (prodData.anomaly || prodData.alert) {
                alerts.push({
                    type: 'warning',
                    message: prodData.anomalyMessage || prodData.alertMessage || 'Anomali produksi terdeteksi hari ini'
                });
            }
        } catch (_) { /* skip */ }

        return alerts;
    }

    /* ───────────────────── HTML builders ───────────────────── */

    function buildWelcomeBanner() {
        var now = new Date();
        var userName = 'Pengguna';
        try {
            if (YWM.PuterInit && YWM.PuterInit.user && YWM.PuterInit.user.username) {
                userName = YWM.PuterInit.user.username;
            }
        } catch (_) { /* keep default */ }

        var greet = greeting(now.getHours());
        var dateStr = formatDateID(now);

        return '' +
            '<div class="glass home-welcome animate-fade-in" style="padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">' +
                '<div>' +
                    '<h1 style="margin:0 0 4px;font-size:1.6rem;font-weight:700;color:#fff;">' + greet + ', <span class="text-accent">' + escapeHtml(userName) + '</span> 👋</h1>' +
                    '<p style="margin:0;font-size:.95rem;color:rgba(255,255,255,.6);">' + escapeHtml(dateStr) + '</p>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<span class="badge badge-info" style="font-size:.8rem;">' + icon('clock', 14) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
                '</div>' +
            '</div>';
    }

    function buildKPICards(kpis) {
        var cards = kpis.map(function (kpi, idx) {
            var trendDir = kpi.trend >= 0 ? 'up' : 'down';
            var trendColor = kpi.trend >= 0 ? 'var(--color-success, #00e676)' : 'var(--color-error, #ff5252)';
            var trendIcon = kpi.trend >= 0 ? icon('trending-up', 14) : icon('trending-down', 14);
            var trendText = kpi.trend >= 0 ? '+' + kpi.trend : '' + kpi.trend;

            return '' +
                '<div class="glass glass-hover kpi-card animate-slide-up" data-kpi="' + kpi.id + '" style="animation-delay:' + (idx * 80) + 'ms;padding:20px 22px;cursor:pointer;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
                        '<div style="width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:' + kpi.color + '22;color:' + kpi.color + ';">' +
                            icon(kpi.icon, 20) +
                        '</div>' +
                        '<span style="display:flex;align-items:center;gap:4px;font-size:.75rem;font-weight:600;color:' + trendColor + ';">' +
                            trendIcon + ' ' + escapeHtml(trendText) + '%' +
                        '</span>' +
                    '</div>' +
                    '<div style="font-size:1.75rem;font-weight:800;color:#fff;line-height:1.2;margin-bottom:4px;">' +
                        formatNumber(kpi.value) +
                    '</div>' +
                    '<div style="font-size:.8rem;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:4px;">' +
                        escapeHtml(kpi.label) +
                        '<span style="color:rgba(255,255,255,.35);font-size:.75rem;">(' + escapeHtml(kpi.unit) + ')</span>' +
                    '</div>' +
                '</div>';
        }).join('');

        return '' +
            '<div class="kpi-row" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:24px;">' +
                cards +
            '</div>';
    }

    function buildProductionSummary(summary) {
        var maxVal = Math.max(summary.curah, summary.bagged, summary.shipped, 1);
        var barHeight = 140;

        var bars = [
            { label: 'Curah Diterima', value: summary.curah, color: '#00d4ff' },
            { label: 'Dikarung', value: summary.bagged, color: '#00e676' },
            { label: 'Dikirim', value: summary.shipped, color: '#ffab00' }
        ];

        var barsHtml = bars.map(function (b) {
            var pct = Math.round((b.value / maxVal) * 100);
            var h = Math.max(Math.round((b.value / maxVal) * barHeight), 4);
            return '' +
                '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;">' +
                    '<span style="font-size:.85rem;font-weight:700;color:#fff;">' + formatNumber(b.value) + '</span>' +
                    '<div style="width:100%;max-width:52px;height:' + barHeight + 'px;background:rgba(255,255,255,.06);border-radius:8px;position:relative;overflow:hidden;display:flex;align-items:flex-end;">' +
                        '<div style="width:100%;height:' + h + 'px;background:' + b.color + ';border-radius:8px;transition:height .6s ease;"></div>' +
                    '</div>' +
                    '<span style="font-size:.7rem;color:rgba(255,255,255,.5);text-align:center;line-height:1.3;">' + escapeHtml(b.label) + '</span>' +
                '</div>';
        }).join('');

        return '' +
            '<div class="glass" style="padding:22px 24px;">' +
                '<h3 style="margin:0 0 18px;font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">' +
                    icon('bar-chart', 16) + ' Ringkasan Produksi Hari Ini' +
                '</h3>' +
                '<div style="display:flex;align-items:flex-end;justify-content:center;gap:28px;padding:0 8px;">' +
                    barsHtml +
                '</div>' +
            '</div>';
    }

    function buildRecentActivities(activities) {
        var itemsHtml = activities.map(function (a) {
            var timeLabel = a.time
                ? '<span class="text-muted" style="font-size:.7rem;white-space:nowrap;">' + escapeHtml(a.time) + '</span>'
                : '';
            var userLabel = a.user
                ? '<span style="color:rgba(255,255,255,.4);font-size:.75rem;"> — ' + escapeHtml(a.user) + '</span>'
                : '';
            return '' +
                '<li style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);">' +
                    '<div style="display:flex;align-items:flex-start;gap:8px;">' +
                        '<span style="color:#00d4ff;margin-top:2px;">' + icon('chevron-right', 14) + '</span>' +
                        '<div>' +
                            '<span style="font-size:.85rem;color:#fff;">' + escapeHtml(a.action) + '</span>' +
                            userLabel +
                        '</div>' +
                    '</div>' +
                    timeLabel +
                '</li>';
        }).join('');

        return '' +
            '<div class="glass" style="padding:22px 24px;">' +
                '<h3 style="margin:0 0 14px;font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">' +
                    icon('activity', 16) + ' Aktivitas Terbaru' +
                '</h3>' +
                '<ul style="list-style:none;margin:0;padding:0;">' +
                    itemsHtml +
                '</ul>' +
            '</div>';
    }

    function buildQuickActions() {
        var actions = [
            { label: 'Input Produksi', icon: 'factory', module: 'production', accent: true },
            { label: 'Buat Work Order', icon: 'wrench', module: 'maintenance', accent: false },
            { label: 'Input Spare Part', icon: 'box', module: 'sparepart', accent: false },
            { label: 'Laporan Harian', icon: 'clipboard', module: 'report', accent: false },
            { label: 'Scan Dokumen', icon: 'scan', module: 'ocr', accent: false }
        ];

        var btns = actions.map(function (a) {
            var cls = a.accent ? 'btn btn-accent' : 'btn';
            return '' +
                '<button class="' + cls + ' btn-sm" data-navigate="' + a.module + '" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">' +
                    icon(a.icon, 15) + ' ' + escapeHtml(a.label) +
                '</button>';
        }).join('');

        return '' +
            '<div style="margin-bottom:24px;">' +
                '<h3 style="margin:0 0 12px;font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">' +
                    icon('plus-circle', 16) + ' Aksi Cepat' +
                '</h3>' +
                '<div class="quick-actions-row" style="display:flex;flex-wrap:wrap;gap:10px;">' +
                    btns +
                '</div>' +
            '</div>';
    }

    function buildAlerts(alerts) {
        if (alerts.length === 0) return '';

        var alertIcons = { warning: 'alert-triangle', error: 'shield' };
        var alertColors = { warning: '#ffab00', error: '#ff5252', info: '#00d4ff' };

        var itemsHtml = alerts.map(function (a) {
            var aIcon = alertIcons[a.type] || 'bell';
            var aColor = alertColors[a.type] || '#ffab00';
            return '' +
                '<div class="glass-light" style="padding:12px 16px;border-left:3px solid ' + aColor + ';display:flex;align-items:flex-start;gap:10px;border-radius:0 8px 8px 0;">' +
                    '<span style="color:' + aColor + ';flex-shrink:0;margin-top:1px;">' + icon(aIcon, 16) + '</span>' +
                    '<span style="font-size:.85rem;color:rgba(255,255,255,.85);line-height:1.4;">' + escapeHtml(a.message) + '</span>' +
                '</div>';
        }).join('');

        return '' +
            '<div style="margin-bottom:24px;">' +
                '<h3 style="margin:0 0 12px;font-size:1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;">' +
                    icon('bell', 16) + ' Peringatan' +
                '</h3>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                    itemsHtml +
                '</div>' +
            '</div>';
    }

    /* ───────────────────── utilities ───────────────────── */

    function escapeHtml(str) {
        if (typeof str !== 'string') str = String(str);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatNumber(n) {
        if (n == null) return '0';
        return Number(n).toLocaleString('id-ID');
    }

    /* ───────────────────── responsive styles ───────────────────── */

    function buildStyles() {
        return '' +
            '<style>' +
                '@keyframes ywm-home-fade-in { from { opacity:0; } to { opacity:1; } }' +
                '@keyframes ywm-home-slide-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }' +

                '.home-module { animation: ywm-home-fade-in .35s ease; }' +

                /* KPI row responsive */
                '.kpi-row { grid-template-columns: repeat(3, 1fr); }' +
                '@media (max-width: 1024px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }' +
                '@media (max-width: 640px) { .kpi-row { grid-template-columns: 1fr; } }' +

                /* Quick status grid */
                '.home-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }' +
                '@media (max-width: 860px) { .home-status-grid { grid-template-columns: 1fr; } }' +

                /* KPI card hover glow */
                '.kpi-card { transition: transform .2s ease, box-shadow .2s ease; }' +
                '.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,255,.12); }' +

                /* Quick actions row scroll on small screens */
                '@media (max-width: 640px) { .quick-actions-row { flex-wrap: nowrap; overflow-x:auto; padding-bottom:6px; } }' +
            '</style>';
    }

    /* ═══════════════════ MODULE EXPORT ═══════════════════ */

    YWM.Modules.home = {
        title: 'Beranda',

        render: async function () {
            var kpis = collectKPIs();
            var prodSummary = collectProductionSummary();
            var activities = collectRecentActivities();
            var alerts = collectAlerts();

            var html = '' +
                buildStyles() +
                '<div class="home-module">' +

                    /* 1 — Welcome Banner */
                    buildWelcomeBanner() +

                    /* 2 — KPI Overview Row */
                    buildKPICards(kpis) +

                    /* 3 — Quick Status Grid */
                    '<div class="home-status-grid" style="margin-bottom:24px;">' +
                        buildProductionSummary(prodSummary) +
                        buildRecentActivities(activities) +
                    '</div>' +

                    /* 4 — Quick Actions */
                    buildQuickActions() +

                    /* 5 — Alerts (only if any) */
                    buildAlerts(alerts) +

                '</div>';

            return html;
        },

        init: async function () {
            var container = document.querySelector('.home-module');
            if (!container) return;

            /* ── KPI card click → navigate to detail module ── */
            container.addEventListener('click', function (e) {
                var kpiCard = e.target.closest('.kpi-card[data-kpi]');
                if (kpiCard) {
                    var kpiId = kpiCard.getAttribute('data-kpi');
                    var moduleMap = {
                        'kpi-production': 'production',
                        'kpi-wo': 'maintenance',
                        'kpi-lowstock': 'sparepart',
                        'kpi-hse': 'hse',
                        'kpi-finance': 'finance',
                        'kpi-team': 'hr'
                    };
                    var target = moduleMap[kpiId];
                    if (target && YWM.App && YWM.App.navigateTo) {
                        YWM.App.navigateTo(target);
                    }
                    return;
                }

                /* ── Quick action buttons ── */
                var actionBtn = e.target.closest('[data-navigate]');
                if (actionBtn) {
                    var mod = actionBtn.getAttribute('data-navigate');
                    if (YWM.App && YWM.App.navigateTo) {
                        YWM.App.navigateTo(mod);
                    }
                    return;
                }
            });

            /* ── Auto-refresh KPIs every 60 seconds ── */
            var refreshInterval = setInterval(async function () {
                // Only refresh if this module is still active
                var isActive = container && container.isConnected;
                if (!isActive) {
                    clearInterval(refreshInterval);
                    return;
                }

                try {
                    var kpis = collectKPIs();
                    kpis.forEach(function (kpi) {
                        var card = container.querySelector('[data-kpi="' + kpi.id + '"]');
                        if (!card) return;

                        // Update value
                        var valEl = card.querySelector('div[style*="font-size:1.75rem"]');
                        if (valEl) valEl.textContent = formatNumber(kpi.value);

                        // Update trend
                        var trendEl = card.querySelector('span[style*="font-size:.75rem"]');
                        if (trendEl) {
                            var trendColor = kpi.trend >= 0 ? 'var(--color-success, #00e676)' : 'var(--color-error, #ff5252)';
                            var trendIcon = kpi.trend >= 0 ? icon('trending-up', 14) : icon('trending-down', 14);
                            var trendText = kpi.trend >= 0 ? '+' + kpi.trend : '' + kpi.trend;
                            trendEl.style.color = trendColor;
                            trendEl.innerHTML = trendIcon + ' ' + escapeHtml(trendText) + '%';
                        }
                    });
                } catch (_) { /* silent */ }
            }, 60000);

            /* ── Trigger initial animations ── */
            requestAnimationFrame(function () {
                var cards = container.querySelectorAll('.kpi-card');
                cards.forEach(function (card) {
                    card.style.opacity = '1';
                });
            });
        }
    };

})();
