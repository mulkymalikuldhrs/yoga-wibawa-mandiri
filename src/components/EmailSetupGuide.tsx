import { useState } from 'react';
import { Mail, Settings, CheckCircle, Copy, ExternalLink } from 'lucide-react';

const EmailSetupGuide = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const emailjsTemplate = `
Halo Tim PT. Yoga Wibawa Mandiri,

Anda menerima pesan baru dari website:

**Detail Pengirim:**
- Nama: {{from_name}}
- Email: {{from_email}}
- Telepon: {{phone}}
- Perusahaan: {{company}}

**Subjek:** {{subject}}

**Pesan:**
{{message}}

**Informasi Tambahan:**
- Waktu: {{timestamp}}
- Sumber: {{website}}

---
Pesan ini dikirim otomatis dari form kontak website PT. Yoga Wibawa Mandiri.
Silakan balas langsung ke email pengirim: {{reply_to}}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <Mail className="w-16 h-16 text-ywm-red mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-ywm-dark mb-2">
          Setup Email Integration
        </h2>
        <p className="text-gray-600">
          Panduan lengkap untuk mengaktifkan pengiriman email dari form kontak
        </p>
      </div>

      <div className="space-y-8">
        {/* Method 1: EmailJS */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-ywm-dark mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-ywm-red" />
            Method 1: EmailJS (Recommended)
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Step 1: Buat Akun EmailJS</h4>
              <p className="text-blue-700 text-sm mb-2">
                Daftar di EmailJS untuk mendapatkan layanan email gratis
              </p>
              <a 
                href="https://www.emailjs.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Buka EmailJS.com
              </a>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Step 2: Setup Email Service</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Pilih Gmail/Outlook sebagai email service</li>
                <li>• Hubungkan dengan email: <strong>mulkymalikuldhaher@mail.com</strong></li>
                <li>• Catat Service ID yang diberikan</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Step 3: Buat Email Template</h4>
              <p className="text-yellow-700 text-sm mb-2">
                Copy template di bawah ini ke EmailJS:
              </p>
              <div className="bg-white border rounded p-3 text-xs font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Email Template:</span>
                  <button
                    onClick={() => copyToClipboard(emailjsTemplate, 'template')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {copied === 'template' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-gray-800">
                  {emailjsTemplate}
                </pre>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Step 4: Update Konfigurasi</h4>
              <p className="text-purple-700 text-sm mb-2">
                Update file <code>src/services/emailService.ts</code> dengan:
              </p>
              <div className="bg-white border rounded p-3 text-xs font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Configuration:</span>
                  <button
                    onClick={() => copyToClipboard(`
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_PUBLIC_KEY = 'your_public_key';
                    `.trim(), 'config')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {copied === 'config' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <pre className="text-gray-800">
{`const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_PUBLIC_KEY = 'your_public_key';`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: Formspree */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-ywm-dark mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-ywm-red" />
            Method 2: Formspree (Alternative)
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Setup Formspree</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Daftar di <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">Formspree.io</a></li>
                <li>2. Buat form baru dengan email: <strong>mulkymalikuldhaher@mail.com</strong></li>
                <li>3. Copy Form ID yang diberikan</li>
                <li>4. Update <code>YOUR_FORMSPREE_ID</code> di emailService.ts</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-ywm-dark mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Status Saat Ini
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Form kontak sudah terintegrasi</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Validasi form sudah aktif</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Target email: mulkymalikuldhaher@mail.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">Perlu konfigurasi EmailJS/Formspree untuk aktivasi penuh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetupGuide;