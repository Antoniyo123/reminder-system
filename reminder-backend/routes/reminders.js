// routes/reminders.js
const express = require('express');
const router = express.Router();
const ReminderSchedule = require('../models/ReminderSchedule');
const Recipient = require('../models/Recipient');
const emailService = require('../services/emailService');
const schedulerService = require('../services/schedulerService'); // Tambahkan ini

// ... endpoint yang sudah ada ...

// POST /api/reminders/trigger-scheduler - Manual trigger scheduler
router.post('/trigger-scheduler', async (req, res) => {
  try {
    console.log('🔄 Manual trigger scheduler...');
    await schedulerService.checkAndSendReminders();
    
    res.status(200).json({
      success: true,
      message: 'Scheduler executed manually'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering scheduler',
      error: error.message
    });
  }
});

module.exports = router;