// models/ReminderSchedule.js
const mongoose = require('mongoose');

const reminderScheduleSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient',
    required: true
  },
  jenisReminder: {
    type: String,
    enum: ['SEBELUM_3_BULAN', 'SEBELUM_1_BULAN', 'SEBELUM_2_MINGGU', 'SEBELUM_1_MINGGU', 'HARI_H', 'LEWAT'],
    required: true
  },
  hariSebelumExpired: {
    type: Number,
    required: true
  },
  tanggalKirim: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  emailResponse: {
    messageId: String,
    response: String,
    error: String,
    sentAt: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

reminderScheduleSchema.index({ recipient: 1 });
reminderScheduleSchema.index({ tanggalKirim: 1 });
reminderScheduleSchema.index({ status: 1 });

module.exports = mongoose.model('ReminderSchedule', reminderScheduleSchema);