const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const emailService = require('../services/emailService');

// GET semua reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// GET reminder by ID
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// POST create new reminder
router.post('/', async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
});

// PUT update reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
});

// DELETE reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// POST send reminder email for specific reminder
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const emailData = {
      to: reminder.email,
      subject: `Pengingat: ${reminder.jenisKitas} akan expired`,
      body: `Halo ${reminder.nama},\n\nDokumen ${reminder.jenisKitas} Anda akan segera expired pada ${reminder.tanggalExp.toLocaleDateString('id-ID')}. Segera perpanjang di imigrasi terdekat.`,
      recipient: reminder
    };

    const result = await emailService.sendReminderEmail(emailData);

    res.status(200).json({
      success: true,
      message: 'Reminder email sent successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder email',
      error: error.message
    });
  }
});

module.exports = router;