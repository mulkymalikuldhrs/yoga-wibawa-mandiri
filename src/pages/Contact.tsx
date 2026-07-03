import { useState } from 'react';
import Layout from '@/components/Layout';
import { MapPin, Phone, Mail, Clock, Send, Loader2, ExternalLink } from 'lucide-react';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import { useToast } from '@/hooks/use-toast';
import { sendContactEmail, type ContactFormData } from '@/services/emailService';

const WHATSAPP_NUMBER = '6285322624048';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama lengkap harus diisi.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: "Error", 
        description: "Email yang valid harus diisi.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Nomor telepon harus diisi.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Error",
        description: "Subjek pesan harus dipilih.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast({
        title: "Error",
        description: "Pesan harus diisi minimal 10 karakter.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      toast({
        title: "Mengirim Pesan...",
        description: "Mohon tunggu, pesan Anda sedang dikirim.",
      });

      const emailSent = await sendContactEmail(formData);

      if (emailSent) {
        toast({
          title: "Pesan Berhasil Terkirim!",
          description: "Terima kasih atas pesan Anda. Tim kami akan menghubungi Anda dalam 24 jam.",
        });

        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: ''
        });
      } else {
        // Email failed — offer WhatsApp fallback
        const waMessage = `Halo PT. Yoga Wibawa Mandiri,

Nama: ${formData.name}
Email: ${formData.email}
Telepon: ${formData.phone}
Perusahaan: ${formData.company || '-'}
Subjek: ${formData.subject}

Pesan:
${formData.message}

Mohon segera direspons. Terima kasih.`;

        toast({
          title: "Email Gagal Terkirim",
          description: "Silakan hubungi kami langsung via WhatsApp dengan klik tombol di bawah.",
          variant: "destructive",
        });

        // Auto-open WhatsApp as fallback
        window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(waMessage)}`, '_blank');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Form submission error:', error);
      
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = `Halo PT. Yoga Wibawa Mandiri, saya ingin berkonsultasi mengenai produk dan layanan Anda.`;
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Hubungi Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in text-red-50">
            Silakan hubungi kami untuk konsultasi, pemesanan, atau informasi lebih lanjut tentang produk Semen Padang PCC
          </p>
        </div>
      </section>

      {/* Quick WhatsApp Contact */}
      <section className="py-10 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <a
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20memesan%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <MessageCircle size={24} />
              <div className="text-left">
                <p className="font-bold">Pemesanan Produk</p>
                <p className="text-green-100 text-sm">+62 853-2262-4048</p>
              </div>
            </a>
            <a
              href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20produk%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Phone size={24} />
              <div className="text-left">
                <p className="font-bold">Konsultasi & Informasi</p>
                <p className="text-green-100 text-sm">+62 853-2262-4038</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-ywm-dark mb-6">
                Kirim <span className="text-ywm-red">Pesan</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Isi formulir di bawah ini dan tim kami akan menghubungi Anda dalam waktu 24 jam.
                Jika form tidak berfungsi, gunakan tombol WhatsApp untuk chat langsung.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ywm-dark mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ywm-dark mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-ywm-dark mb-2">
                      No. Telepon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-ywm-dark mb-2">
                      Perusahaan
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Nama perusahaan (opsional)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-ywm-dark mb-2">
                    Subjek *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih subjek pesan</option>
                    <option value="Pemesanan Semen">Pemesanan Semen</option>
                    <option value="Konsultasi Teknis">Konsultasi Teknis</option>
                    <option value="Kemitraan Bisnis">Kemitraan Bisnis</option>
                    <option value="Informasi Umum">Informasi Umum</option>
                    <option value="Keluhan/Saran">Keluhan/Saran</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ywm-dark mb-2">
                    Pesan * <span className="text-gray-500">(minimal 10 karakter)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                    minLength={10}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/500 karakter
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-ywm-red text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Mengirim Pesan...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Fallback */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="text-green-600" size={18} />
                    <p className="text-sm text-green-800 font-semibold">
                      Lebih cepat via WhatsApp?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Chat via WhatsApp
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="animate-slide-in-right">
              <h2 className="text-3xl font-bold text-ywm-dark mb-6">
                Informasi <span className="text-ywm-red">Kontak</span>
              </h2>

              <div className="space-y-6">
                {/* WhatsApp Card */}
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <MessageCircle size={22} />
                    Chat WhatsApp Langsung
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Respons cepat dalam hitungan menit pada jam kerja
                  </p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <MessageCircle size={20} />
                    +62 853-2262-4048
                    <ExternalLink size={16} />
                  </button>
                </div>

                {/* Kantor Pusat */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-ywm-dark mb-4">Kantor Pusat</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="text-ywm-red mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-gray-700">
                          Jl. Paduan Tenaga No. 12<br />
                          Medan, Sumatera Utara 20112
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="text-ywm-red flex-shrink-0" size={20} />
                      <p className="text-gray-700">+6285322624048</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="text-ywm-red flex-shrink-0" size={20} />
                      <p className="text-gray-700">info@ywm.co.id</p>
                    </div>
                  </div>
                </div>

                {/* Pabrik */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-ywm-dark mb-4">Packing Plant</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="text-ywm-red mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-gray-700">
                          Jl. Pelabuhan Umum, Kr. Geukuh<br />
                          Aceh Utara, Aceh 24352
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="text-ywm-red flex-shrink-0" size={20} />
                      <p className="text-gray-700">+6285322624048</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="text-ywm-red flex-shrink-0" size={20} />
                      <p className="text-gray-700">pabrik@ywm.co.id</p>
                    </div>
                  </div>
                </div>

                {/* Jam Operasional */}
                <div className="glass-card-dark text-white p-6">
                  <h3 className="text-xl font-semibold mb-4">Jam Operasional</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Clock size={20} />
                      <div>
                        <p className="font-medium">Senin - Jumat</p>
                        <p className="text-red-200">08:00 - 17:00 WIB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock size={20} />
                      <div>
                        <p className="font-medium">Sabtu</p>
                        <p className="text-red-200">08:00 - 12:00 WIB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock size={20} />
                      <div>
                        <p className="font-medium">Minggu</p>
                        <p className="text-red-200">Tutup</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.215165924775!2d97.1461977!3d5.1893289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3047b7e8a4e3b4b3%3A0x9e8e8e8e8e8e8e8e!2sPelabuhan%20Krueng%20Geukueh!5e0!3m2!1sid!2sid!4v1690000000000"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Peta Lokasi Pabrik PT. Yoga Wibawa Mandiri"
                  ></iframe>
                  <div className="p-3 bg-gray-50 text-center">
                    <a 
                      href="https://maps.app.goo.gl/example" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-ywm-red hover:text-red-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MapPin size={16} />
                      Buka di Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ywm-dark mb-4">
              Kontak <span className="text-ywm-red">Darurat</span>
            </h2>
            <p className="text-gray-600 mb-8">
              Untuk keperluan mendesak di luar jam operasional
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center space-x-3">
                <Phone className="text-ywm-red" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-ywm-dark">Hotline 24 Jam</p>
                  <p className="text-gray-600">+6285322624048</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-ywm-red" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-ywm-dark">Email Darurat</p>
                  <p className="text-gray-600">yogawibawamandiri@gmail.com</p>
                </div>
              </div>
              <a
                href="https://wa.me/6285322624038"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                <MessageCircle size={24} />
                <div className="text-left">
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-green-100 text-sm">+62 853-2262-4038</p>
                </div>
              </a>
            </div>
            <div className="mt-8">
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <MessageCircle size={20} />
                Chat WhatsApp Darurat
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
