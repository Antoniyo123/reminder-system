// server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// === Import services & config ===
const connectDB = require('./config/database');
const emailService = require('./services/emailService');
const schedulerService = require('./services/schedulerService');

// === Import routes ===
const authRoutes = require('./routes/authRoutes');
const recipientRoutes = require('./routes/recipients');
const reminderRoutes = require('./routes/reminders');

// === Inisialisasi Express ===
const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());

// === Koneksi ke Database ===
connectDB();

// === Routes API ===
app.use('/api/auth', authRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/reminders', reminderRoutes);

// === Health check endpoint ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected',
    email: 'Ready',
    scheduler: 'Running'
  });
});

// === Email Test Endpoint ===
app.post('/api/email-test', async (req, res) => {
  try {
    const emailData = {
      to: req.body.to,
      subject: req.body.subject,
      body: req.body.body,
      recipient: {
        nama: req.body.recipient.nama,
        perusahaan: req.body.recipient.perusahaan,
        jenisKitas: req.body.recipient.jenisKitas,
        tanggalExp: req.body.recipient.tanggalExp,
        email: req.body.recipient.email
      }
    };

    const result = await emailService.sendReminderEmail(emailData);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 4000;

// === Serve React Frontend Build ===
const frontendPath = path.join(__dirname, '../reminder-indobiz/build');
app.use(express.static(frontendPath));

// === Fallback ke React untuk route non-API ===
// ⚠️ GUNAKAN regex /.*$/ AGAR KOMPATIBEL DENGAN EXPRESS 5
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// === Jalankan server ===
app.listen(PORT, () => {
  console.log(`
✨ ========================================
🚀 Visa Reminder Backend Server Started!
✨ ========================================
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🗄️  Database: ${process.env.MONGODB_URI}
📧 Email Service: ${process.env.EMAIL_SERVICE}
👤 Email User: ${process.env.EMAIL_USER}
⏰ Scheduler: Running (Daily 08:00 AM)
📊 Health Check: http://localhost:${PORT}/api/health
🧪 Email Test: http://localhost:${PORT}/api/email-test
✨ ========================================
  `);

  // Verify email connection
  emailService.verifyConnection()
    .then(result => {
      if (result.success) {
        console.log('✅ Email service: READY');
      } else {
        console.log('❌ Email service: NOT READY -', result.error);
      }
    })
    .catch(err => {
      console.log('❌ Email service: NOT READY -', err.message);
    });

  // Start scheduler
  schedulerService.start();
});
