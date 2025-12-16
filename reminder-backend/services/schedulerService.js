// services/schedulerService.js
const cron = require('node-cron');
const Recipient = require('../models/Recipient');
const ReminderSchedule = require('../models/ReminderSchedule');
const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.job = null;
  }

  start() {
    // Jalankan setiap hari jam 08:00 pagi
    this.job = cron.schedule('0 8 * * *', async () => {
      console.log('🕐 Running daily reminder check...');
      await this.checkAndSendReminders();
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });

    console.log('✅ Scheduler started: Daily at 08:00 AM');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('❌ Scheduler stopped');
    }
  }

  async checkAndSendReminders() {
    try {
      const today = new Date();
      const recipients = await Recipient.find({ status: 'AKTIF' });

      for (const recipient of recipients) {
        const daysUntilExpired = Math.ceil((recipient.tanggalExpired - today) / (1000 * 60 * 60 * 24));
        
        // Tentukan jenis reminder berdasarkan hari sampai expired
        let jenisReminder = null;
        if (daysUntilExpired === 90) {
          jenisReminder = 'SEBELUM_3_BULAN';
        } else if (daysUntilExpired === 30) {
          jenisReminder = 'SEBELUM_1_BULAN';
        } else if (daysUntilExpired === 14) {
          jenisReminder = 'SEBELUM_2_MINGGU';
        } else if (daysUntilExpired === 7) {
          jenisReminder = 'SEBELUM_1_MINGGU';
        } else if (daysUntilExpired === 0) {
          jenisReminder = 'HARI_H';
        } else if (daysUntilExpired < 0) {
          jenisReminder = 'LEWAT';
        }

        if (jenisReminder) {
          await this.sendReminder(recipient, jenisReminder, daysUntilExpired);
        }
      }
    } catch (error) {
      console.error('❌ Error in reminder scheduler:', error);
    }
  }

  async sendReminder(recipient, jenisReminder, daysUntilExpired) {
    try {
      // Cek apakah reminder sudah dikirim untuk jenis ini
      const existingReminder = await ReminderSchedule.findOne({
        recipient: recipient._id,
        jenisReminder: jenisReminder
      });

      if (existingReminder) {
        console.log(`⏭️ Reminder already sent for ${recipient.nama} (${jenisReminder})`);
        return;
      }

      const subject = this.getReminderSubject(jenisReminder, recipient.jenisDokumen);
      const body = this.getReminderBody(recipient, jenisReminder, daysUntilExpired);

      const emailData = {
        to: recipient.email,
        subject: subject,
        body: body,
        recipient: recipient
      };

      const result = await emailService.sendReminderEmail(emailData);

      // Simpan ke reminder schedule
      await ReminderSchedule.create({
        recipient: recipient._id,
        jenisReminder: jenisReminder,
        hariSebelumExpired: daysUntilExpired,
        tanggalKirim: new Date(),
        status: 'SENT',
        emailResponse: {
          messageId: result.messageId,
          response: result.response,
          sentAt: new Date()
        }
      });

      console.log(`✅ Reminder sent to ${recipient.nama} (${jenisReminder})`);
    } catch (error) {
      console.error(`❌ Failed to send reminder to ${recipient.nama}:`, error);

      // Simpan reminder yang gagal
      await ReminderSchedule.create({
        recipient: recipient._id,
        jenisReminder: jenisReminder,
        hariSebelumExpired: daysUntilExpired,
        tanggalKirim: new Date(),
        status: 'FAILED',
        emailResponse: {
          error: error.message
        }
      });
    }
  }

  getReminderSubject(jenisReminder, jenisDokumen) {
    const prefixes = {
      'SEBELUM_3_BULAN': 'Pengingat 3 Bulan Sebelum Expired',
      'SEBELUM_1_BULAN': 'Pengingat 1 Bulan Sebelum Expired',
      'SEBELUM_2_MINGGU': 'Pengingat 2 Minggu Sebelum Expired',
      'SEBELUM_1_MINGGU': 'Pengingat 1 Minggu Sebelum Expired',
      'HARI_H': 'Pengingat Hari Ini Expired',
      'LEWAT': 'Peringatan Dokumen Expired'
    };

    return `${prefixes[jenisReminder]} - ${jenisDokumen}`;
  }

  getReminderBody(recipient, jenisReminder, daysUntilExpired) {
    const formattedDate = recipient.tanggalExpired.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const messages = {
      'SEBELUM_3_BULAN': `Halo ${recipient.nama},\n\nDokumen ${recipient.jenisDokumen} Anda akan expired dalam 3 bulan (${formattedDate}). Silakan persiapkan perpanjangan dokumen.`,
      'SEBELUM_1_BULAN': `Halo ${recipient.nama},\n\nDokumen ${recipient.jenisDokumen} Anda akan expired dalam 1 bulan (${formattedDate}). Segera lakukan perpanjangan dokumen.`,
      'SEBELUM_2_MINGGU': `Halo ${recipient.nama},\n\nDokumen ${recipient.jenisDokumen} Anda akan expired dalam 2 minggu (${formattedDate}). Harap segera perpanjang dokumen Anda.`,
      'SEBELUM_1_MINGGU': `Halo ${recipient.nama},\n\nDokumen ${recipient.jenisDokumen} Anda akan expired dalam 1 minggu (${formattedDate}). Segera hubungi tim imigrasi untuk perpanjangan.`,
      'HARI_H': `Halo ${recipient.nama},\n\nHari ini adalah tanggal expired untuk dokumen ${recipient.jenisDokumen} Anda (${formattedDate}). Segera lakukan perpanjangan.`,
      'LEWAT': `Halo ${recipient.nama},\n\nDokumen ${recipient.jenisDokumen} Anda telah expired sejak ${formattedDate}. Segera hubungi tim imigrasi untuk menghindari denda.`
    };

    return messages[jenisReminder];
  }
}

module.exports = new SchedulerService();