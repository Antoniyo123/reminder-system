// routes/recipients.js
const express = require('express');
const router = express.Router();
const Recipient = require('../models/Recipient');

// GET /api/recipients - Get all recipients
router.get('/', async (req, res) => {
  try {
    const recipients = await Recipient.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// GET /api/recipients/:id - Get single recipient
router.get('/:id', async (req, res) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    res.status(200).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// POST /api/recipients - Create new recipient
router.post('/', async (req, res) => {
  try {
    const recipient = await Recipient.create(req.body);
    res.status(201).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating recipient',
      error: error.message
    });
  }
});

// PUT /api/recipients/:id - Update recipient
router.put('/:id', async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    res.status(200).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating recipient',
      error: error.message
    });
  }
});

// DELETE /api/recipients/:id - Delete recipient
router.delete('/:id', async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndDelete(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;