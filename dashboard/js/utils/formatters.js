/**
 * ============================================
 * FORMATTERS - Utilitas Format Data
 * PT Yoga Wibawa Mandiri - Technical Dashboard
 * ============================================
 * Modul ini menyediakan fungsi formatting untuk:
 * - Tanggal & Waktu (format Indonesia)
 * - Mata Uang (Rupiah)
 * - Angka (ribuan, desimal)
 * - Durasi (jam, menit)
 */

// --- Format Tanggal ---

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {string} format - Tipe format: 'full', 'short', 'time', 'relative'
 * @returns {string} Tanggal terformat
 */
function formatTanggal(date, format = 'short') {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const bulanShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    switch (format) {
        case 'full':
            return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
        case 'short':
            return `${d.getDate()} ${bulanShort[d.getMonth()]} ${d.getFullYear()}`;
        case 'datetime':
            return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        case 'time':
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        case 'relative':
            return formatRelative(d);
        case 'iso':
            return d.toISOString();
        default:
            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
}

/**
 * Format tanggal relatif (berapa lama yang lalu)
 * @param {Date} date - Tanggal acuan
 * @returns {string} Waktu relatif dalam Bahasa Indonesia
 */
function formatRelative(date) {
    const now = new Date();
    const diff = now - date;
    const detik = Math.floor(diff / 1000);
    const menit = Math.floor(detik / 60);
    const jam = Math.floor(menit / 60);
    const hari = Math.floor(jam / 24);
    const minggu = Math.floor(hari / 7);
    const bulan = Math.floor(hari / 30);

    if (detik < 60) return 'Baru saja';
    if (menit < 60) return `${menit} menit lalu`;
    if (jam < 24) return `${jam} jam lalu`;
    if (hari < 7) return `${hari} hari lalu`;
    if (minggu < 4) return `${minggu} minggu lalu`;
    if (bulan < 12) return `${bulan} bulan lalu`;
    return `${Math.floor(bulan / 12)} tahun lalu`;
}

/**
 * Dapatkan timestamp saat ini dalam format ISO
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Dapatkan timestamp lokal yang mudah dibaca
 * @returns {string} Timestamp lokal
 */
function getLocalTimestamp() {
    return formatTanggal(new Date(), 'datetime');
}

// --- Format Mata Uang ---

/**
 * Format angka ke Rupiah Indonesia
 * @param {number} angka - Jumlah uang
 * @param {boolean} denganSimbol - Tampilkan prefix Rp
 * @returns {string} Format Rupiah
 */
function formatRupiah(angka, denganSimbol = true) {
    if (angka === null || angka === undefined || isNaN(angka)) return '-';
    const nilai = Math.abs(Number(angka));
    const formatNilai = nilai.toLocaleString('id-ID');
    const prefix = angka < 0 ? '- ' : '';
    return denganSimbol ? `${prefix}Rp ${formatNilai}` : `${prefix}${formatNilai}`;
}

/**
 * Parse string Rupiah ke angka
 * @param {string} str - String Rupiah (contoh: "Rp 1.500.000")
 * @returns {number} Angka
 */
function parseRupiah(str) {
    if (!str) return 0;
    return Number(String(str).replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
}

// --- Format Angka ---

/**
 * Format angka dengan pemisah ribuan
 * @param {number} angka - Angka yang akan diformat
 * @param {number} desimal - Jumlah angka di belakang koma
 * @returns {string} Angka terformat
 */
function formatAngka(angka, desimal = 0) {
    if (angka === null || angka === undefined || isNaN(angka)) return '-';
    return Number(angka).toLocaleString('id-ID', {
        minimumFractionDigits: desimal,
        maximumFractionDigits: desimal
    });
}

/**
 * Format angka ke singkatan (1K, 1M, etc)
 * @param {number} angka - Angka yang akan diformat
 * @returns {string} Angka terformat singkat
 */
function formatAngkaSingkat(angka) {
    if (angka === null || angka === undefined || isNaN(angka)) return '-';
    if (angka >= 1000000000) return `${(angka / 1000000000).toFixed(1)}M`;
    if (angka >= 1000000) return `${(angka / 1000000).toFixed(1)}Jt`;
    if (angka >= 1000) return `${(angka / 1000).toFixed(1)}Rb`;
    return String(angka);
}

/**
 * Format persentase
 * @param {number} nilai - Nilai (0-100)
 * @param {number} desimal - Jumlah angka desimal
 * @returns {string} Persentase terformat
 */
function formatPersen(nilai, desimal = 1) {
    if (nilai === null || nilai === undefined || isNaN(nilai)) return '-';
    return `${Number(nilai).toFixed(desimal)}%`;
}

// --- Format Durasi ---

/**
 * Format durasi dari menit ke string yang mudah dibaca
 * @param {number} menit - Durasi dalam menit
 * @returns {string} Durasi terformat
 */
function formatDurasi(menit) {
    if (!menit || isNaN(menit)) return '-';
    if (menit < 60) return `${menit} menit`;
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    if (jam < 24) return sisaMenit > 0 ? `${jam} jam ${sisaMenit} menit` : `${jam} jam`;
    const hari = Math.floor(jam / 24);
    const sisaJam = jam % 24;
    return sisaJam > 0 ? `${hari} hari ${sisaJam} jam` : `${hari} hari`;
}

// --- Format untuk Export ---

/**
 * Format data ke CSV string
 * @param {Array<Object>} data - Array of objects
 * @returns {string} CSV string
 */
function formatCSV(data) {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
}

/**
 * Download data sebagai file
 * @param {string} content - Isi file
 * @param {string} filename - Nama file
 * @param {string} mimeType - Tipe MIME
 */
function downloadFile(content, filename, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export untuk modul
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTanggal, formatRelative, getTimestamp, getLocalTimestamp,
        formatRupiah, parseRupiah,
        formatAngka, formatAngkaSingkat, formatPersen,
        formatDurasi, formatCSV, downloadFile
    };
}
