import emailjs from '@emailjs/browser';

// EmailJS configuration - use environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (formData: ContactFormData): Promise<boolean> => {
  try {
    // Guard: skip if EmailJS not configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      if (import.meta.env.DEV) console.warn('[EmailService] EmailJS not configured — email not sent');
      return false;
    }

    // Initialize EmailJS (only needs to be done once)
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Prepare email template parameters
    const templateParams = {
      to_email: 'info@ywm.co.id',
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      company: formData.company || 'Tidak disebutkan',
      subject: formData.subject,
      message: formData.message,
      reply_to: formData.email,
      // Additional info
      timestamp: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      website: 'PT. Yoga Wibawa Mandiri Website'
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    // Success confirmed (no sensitive data logged)
    if (import.meta.env.DEV) {
      console.info('[EmailService] Email sent successfully, status:', response.status);
    }
    return response.status === 200;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to send email:', error);
    return false;
  }
};

// Alternative method using Formspree (backup option)
export const sendContactEmailFormspree = async (formData: ContactFormData): Promise<boolean> => {
  try {
    const response = await fetch(import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/YOUR_FORMSPREE_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
        _replyto: formData.email,
        _subject: `Pesan Baru dari Website: ${formData.subject}`,
        _cc: 'info@ywm.co.id'
      }),
    });

    return response.ok;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to send email via Formspree:', error);
    return false;
  }
};