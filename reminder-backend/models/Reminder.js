const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  perusahaan: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  jenisKitas: {
    type: String,
    required: true,
    trim: true
  },
  tanggalExp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'renewed'],
    default: 'active'
  }
}, {
  timestamps: true // akan menambahkan createdAt dan updatedAt
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;