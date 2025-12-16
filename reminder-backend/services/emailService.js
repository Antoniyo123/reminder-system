const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Send reminder email
   * @param {Object} emailData
   * @param {string} emailData.to
   * @param {string} emailData.subject
   * @param {string} emailData.body
   * @param {Object} emailData.recipient
   * @param {string} emailData.language 'en' | 'id'
   */
  async sendReminderEmail(emailData) {
    try {
      const {
        to,
        subject,
        body,
        recipient,
        language = 'en'
      } = emailData;

      const htmlTemplate = this.generateHTMLTemplate(
        body,
        recipient,
        language
      );

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html: htmlTemplate,
        text: body
      };

      console.log(`📧 Sending email to ${to} [${language}]`);

      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email sent:', result.messageId);

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Generate HTML email template
   */
  generateHTMLTemplate(body, recipient, language = 'en') {
    const labels = {
      en: {
        title: 'Visa Expiry Reminder',
        subtitle: 'Important Immigration Document Notice',
        name: 'Name',
        company: 'Company',
        document: 'Document Type',
        expiry: 'Expiry Date',
        email: 'Email',
        action:
          'Please contact your immigration team immediately to renew your document.',
        footerAuto:
          'This email was sent automatically. Please do not reply.',
        footerHelp:
          'If you have any questions, please contact the system administrator.'
      },
      id: {
        title: 'Visa Reminder',
        subtitle: 'Pengingat Dokumen Keimigrasian',
        name: 'Nama',
        company: 'Perusahaan',
        document: 'Jenis Dokumen',
        expiry: 'Tanggal Expired',
        email: 'Email',
        action:
          'Segera hubungi tim imigrasi untuk memperpanjang dokumen Anda.',
        footerAuto:
          'Email ini dikirim secara otomatis. Mohon tidak membalas email ini.',
        footerHelp:
          'Jika Anda memiliki pertanyaan, hubungi administrator sistem.'
      }
    };

    const t = labels[language] || labels.en;

    const locale = language === 'id' ? 'id-ID' : 'en-US';

    const formattedDate = new Date(recipient.tanggalExp).toLocaleDateString(
      locale,
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f4c430, #e6b82e);
      padding: 30px;
      text-align: center;
      color: #2c3e50;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin-top: 10px;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .message-body {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      white-space: pre-line;
      line-height: 1.7;
    }
    .info-section {
      background: #f8f9fa;
      border-left: 4px solid #f4c430;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
    }
    .info-label {
      font-weight: 600;
    }
    .urgent {
      color: #dc2626;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      font-size: 12px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 ${t.title}</h1>
      <p>${t.subtitle}</p>
    </div>

    <div class="content">
      <div class="message-body">
        ${body.replace(/\n/g, '<br>')}
      </div>

      <div class="info-section">
        <div class="info-item">
          <span class="info-label">${t.name}:</span>
          <span>${recipient.nama}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t.company}:</span>
          <span>${recipient.perusahaan}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t.document}:</span>
          <span>${recipient.jenisKitas}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t.expiry}:</span>
          <span class="urgent">${formattedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${t.email}:</span>
          <span>${recipient.email}</span>
        </div>
      </div>

      <p style="text-align:center; margin-top:30px;">
        <strong>${t.action}</strong>
      </p>
    </div>

    <div class="footer">
      <p>${t.footerAuto}</p>
      <p>${t.footerHelp}</p>
      <p>&copy; ${new Date().getFullYear()} Visa Reminder System</p>
    </div>
  </div>
</body>
</html>
    `;
  }

async verifyConnection() {
  try {
    await this.transporter.verify();
    console.log('✅ Email server ready');
    return {
      success: true,
      message: 'Email server is ready'
    };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

}

module.exports = new EmailService();
