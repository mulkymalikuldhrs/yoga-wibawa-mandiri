/**
 * ============================================
 * PUTER.JS INITIALIZATION & AUTH
 * PT Yoga Wibawa Mandiri - Technical Dashboard
 * ============================================
 * Modul ini menangani:
 * - Inisialisasi Puter.js SDK
 * - Autentikasi pengguna (auto-login)
 * - Deteksi status koneksi
 * - Event listener status online/offline
 */

// Namespace global untuk YWM Dashboard
window.YWM = window.YWM || {};

const PuterInit = {
    /** Status inisialisasi */
    initialized: false,
    /** Data pengguna saat ini */
    user: null,
    /** Status koneksi */
    online: navigator.onLine,

    /**
     * Inisialisasi Puter.js dan autentikasi
     * @returns {Promise<Object>} Data pengguna
     */
    async init() {
        try {
            console.log('[PuterInit] Memulai inisialisasi Puter.js...');

            // Tunggu hingga Puter.js tersedia
            await this.waitForPuter();

            // Cek apakah pengguna sudah login
            try {
                this.user = await puter.auth.getUser();
                console.log('[PuterInit] Pengguna sudah login:', this.user?.username);
            } catch (e) {
                // Belum login, coba auto-login
                console.log('[PuterInit] Belum login, mencoba autentikasi...');
                try {
                    await puter.auth.signIn();
                    this.user = await puter.auth.getUser();
                    console.log('[PuterInit] Login berhasil:', this.user?.username);
                } catch (authErr) {
                    console.warn('[PuterInit] Autentikasi ditolak/dibatalkan:', authErr.message);
                    // Lanjutkan tanpa login (fitur terbatas)
                    this.user = { username: 'Guest', isGuest: true };
                }
            }

            this.initialized = true;
            console.log('[PuterInit] Inisialisasi selesai');

            // Dispatch event siap
            window.dispatchEvent(new CustomEvent('puter-ready', {
                detail: { user: this.user }
            }));

            return this.user;
        } catch (error) {
            console.error('[PuterInit] Gagal inisialisasi:', error);
            this.user = { username: 'Guest', isGuest: true };
            this.initialized = true;

            window.dispatchEvent(new CustomEvent('puter-ready', {
                detail: { user: this.user, error: error.message }
            }));

            return this.user;
        }
    },

    /**
     * Tunggu hingga objek puter tersedia di window
     * @param {number} timeout - Timeout dalam ms
     * @returns {Promise<void>}
     */
    waitForPuter(timeout = 15000) {
        return new Promise((resolve, reject) => {
            if (typeof puter !== 'undefined') {
                resolve();
                return;
            }

            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (typeof puter !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error('Timeout menunggu Puter.js'));
                }
            }, 200);
        });
    },

    /**
     * Update tampilan status bar
     */
    updateStatusBar() {
        const statusDot = document.getElementById('connection-status-dot');
        const statusText = document.getElementById('connection-status-text');
        if (statusDot) {
            statusDot.className = `status-dot ${this.online ? 'online' : 'offline'}`;
        }
        if (statusText) {
            statusText.textContent = this.online ? 'Terhubung' : 'Offline';
        }
    },

    /**
     * Cek apakah Puter.js siap digunakan
     * @returns {boolean}
     */
    isReady() {
        return this.initialized && typeof puter !== 'undefined';
    },

    /**
     * Cek apakah pengguna sudah terautentikasi
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.user && !this.user.isGuest;
    },

    /**
     * Logout pengguna
     */
    async logout() {
        try {
            if (typeof puter !== 'undefined') {
                await puter.auth.signOut();
            }
        } catch (e) {
            console.warn('[PuterInit] Error logout:', e);
        }
        this.user = null;
        window.location.reload();
    }
};

// Simpan ke namespace global
window.YWM.PuterInit = PuterInit;
