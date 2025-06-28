import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_ywm_contact';
const EMAILJS_TEMPLATE_ID = 'template_ywm_contact';
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // This will be configured

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
    // Initialize EmailJS (only needs to be done once)
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Prepare email template parameters
    const templateParams = {
      to_email: 'mulkymalikuldhaher@mail.com',
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

    console.log('Email sent successfully:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Alternative method using Formspree (backup option)
export const sendContactEmailFormspree = async (formData: ContactFormData): Promise<boolean> => {
  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
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
        _cc: 'mulkymalikuldhaher@mail.com'
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email via Formspree:', error);
    return false;
  }
};