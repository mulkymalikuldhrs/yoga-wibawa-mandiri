/**
 * ============================================
 * VALIDATORS - Utilitas Validasi Input
 * PT Yoga Wibawa Mandiri - Technical Dashboard
 * ============================================
 * Modul ini menyediakan fungsi validasi untuk:
 * - Teks (wajib, panjang, pola)
 * - Angka (range, positif, integer)
 * - Email, telepon
 * - Form lengkap
 */

// --- Validasi Teks ---

/**
 * Validasi teks wajib diisi
 * @param {string} value - Nilai input
 * @param {string} fieldName - Nama field untuk pesan error
 * @returns {{valid: boolean, error: string|null}}
 */
function validateRequired(value, fieldName = 'Field') {
    if (value === null || value === undefined || String(value).trim() === '') {
        return { valid: false, error: `${fieldName} wajib diisi` };
    }
    return { valid: true, error: null };
}

/**
 * Validasi panjang teks minimum
 * @param {string} value - Nilai input
 * @param {number} min - Panjang minimum
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateMinLength(value, min, fieldName = 'Field') {
    if (!value || String(value).length < min) {
        return { valid: false, error: `${fieldName} minimal ${min} karakter` };
    }
    return { valid: true, error: null };
}

/**
 * Validasi panjang teks maksimum
 * @param {string} value - Nilai input
 * @param {number} max - Panjang maksimum
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateMaxLength(value, max, fieldName = 'Field') {
    if (value && String(value).length > max) {
        return { valid: false, error: `${fieldName} maksimal ${max} karakter` };
    }
    return { valid: true, error: null };
}

// --- Validasi Angka ---

/**
 * Validasi angka (number)
 * @param {*} value - Nilai input
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateNumber(value, fieldName = 'Field') {
    if (value === null || value === undefined || value === '') {
        return { valid: false, error: `${fieldName} wajib diisi` };
    }
    if (isNaN(Number(value))) {
        return { valid: false, error: `${fieldName} harus berupa angka` };
    }
    return { valid: true, error: null };
}

/**
 * Validasi angka positif
 * @param {*} value - Nilai input
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validatePositive(value, fieldName = 'Field') {
    const numResult = validateNumber(value, fieldName);
    if (!numResult.valid) return numResult;
    if (Number(value) < 0) {
        return { valid: false, error: `${fieldName} harus bernilai positif` };
    }
    return { valid: true, error: null };
}

/**
 * Validasi range angka
 * @param {*} value - Nilai input
 * @param {number} min - Nilai minimum
 * @param {number} max - Nilai maksimum
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateRange(value, min, max, fieldName = 'Field') {
    const numResult = validateNumber(value, fieldName);
    if (!numResult.valid) return numResult;
    const num = Number(value);
    if (num < min || num > max) {
        return { valid: false, error: `${fieldName} harus antara ${min} dan ${max}` };
    }
    return { valid: true, error: null };
}

/**
 * Validasi integer
 * @param {*} value - Nilai input
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateInteger(value, fieldName = 'Field') {
    const numResult = validateNumber(value, fieldName);
    if (!numResult.valid) return numResult;
    if (!Number.isInteger(Number(value))) {
        return { valid: false, error: `${fieldName} harus berupa bilangan bulat` };
    }
    return { valid: true, error: null };
}

// --- Validasi Format ---

/**
 * Validasi email
 * @param {string} value - Email
 * @returns {{valid: boolean, error: string|null}}
 */
function validateEmail(value) {
    if (!value) return { valid: false, error: 'Email wajib diisi' };
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(String(value))) {
        return { valid: false, error: 'Format email tidak valid' };
    }
    return { valid: true, error: null };
}

/**
 * Validasi nomor telepon Indonesia
 * @param {string} value - Nomor telepon
 * @returns {{valid: boolean, error: string|null}}
 */
function validateTelepon(value) {
    if (!value) return { valid: true, error: null }; // opsional
    const cleaned = String(value).replace(/[\s\-()]/g, '');
    const pattern = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!pattern.test(cleaned)) {
        return { valid: false, error: 'Nomor telepon tidak valid (gunakan format Indonesia)' };
    }
    return { valid: true, error: null };
}

/**
 * Validasi tanggal
 * @param {string} value - Tanggal (string)
 * @returns {{valid: boolean, error: string|null}}
 */
function validateDate(value) {
    if (!value) return { valid: false, error: 'Tanggal wajib diisi' };
    const d = new Date(value);
    if (isNaN(d.getTime())) {
        return { valid: false, error: 'Format tanggal tidak valid' };
    }
    return { valid: true, error: null };
}

/**
 * Validasi pilihan (select/enum)
 * @param {*} value - Nilai yang dipilih
 * @param {Array} options - Daftar pilihan valid
 * @param {string} fieldName - Nama field
 * @returns {{valid: boolean, error: string|null}}
 */
function validateEnum(value, options, fieldName = 'Field') {
    if (!value) return { valid: false, error: `${fieldName} wajib dipilih` };
    if (!options.includes(value)) {
        return { valid: false, error: `${fieldName} tidak valid` };
    }
    return { valid: true, error: null };
}

// --- Validasi Form Lengkap ---

/**
 * Validasi multiple fields sekaligus
 * @param {Object} data - Data form {field: value}
 * @param {Object} rules - Aturan validasi {field: [{validator, params, message}]}
 * @returns {{valid: boolean, errors: Object}}
 */
function validateForm(data, rules) {
    const errors = {};
    let valid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
        for (const rule of fieldRules) {
            const result = rule.validator(data[field], ...(rule.params || []), rule.fieldName || field);
            if (!result.valid) {
                errors[field] = result.error;
                valid = false;
                break; // ambil error pertama per field
            }
        }
    }

    return { valid, errors };
}

/**
 * Tampilkan error validasi ke form
 * @param {Object} errors - Object error {field: message}
 * @param {string} formId - ID form element
 */
function showFormErrors(errors, formId) {
    // Bersihkan error sebelumnya
    document.querySelectorAll(`#${formId} .form-error`).forEach(el => el.remove());
    document.querySelectorAll(`#${formId} .input-error`).forEach(el => {
        el.classList.remove('input-error');
    });

    for (const [field, message] of Object.entries(errors)) {
        const input = document.querySelector(`#${formId} [name="${field}"]`);
        if (input) {
            input.classList.add('input-error');
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.style.cssText = 'color: var(--status-error); font-size: 0.7rem; margin-top: 4px;';
            errorEl.textContent = message;
            input.parentNode.appendChild(errorEl);
        }
    }
}

/**
 * Bersihkan error validasi pada form
 * @param {string} formId - ID form element
 */
function clearFormErrors(formId) {
    document.querySelectorAll(`#${formId} .form-error`).forEach(el => el.remove());
    document.querySelectorAll(`#${formId} .input-error`).forEach(el => {
        el.classList.remove('input-error');
    });
}

// Style untuk input error
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    .input-error {
        border-color: var(--status-error) !important;
        box-shadow: 0 0 8px rgba(255, 82, 82, 0.2) !important;
    }
`;
document.head.appendChild(errorStyle);

// Export untuk modul
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateRequired, validateMinLength, validateMaxLength,
        validateNumber, validatePositive, validateRange, validateInteger,
        validateEmail, validateTelepon, validateDate, validateEnum,
        validateForm, showFormErrors, clearFormErrors
    };
}
