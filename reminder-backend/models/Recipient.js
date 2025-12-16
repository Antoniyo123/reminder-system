// models/Recipient.js
const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true
  },
  perusahaan: {
    type: String,
    required: [true, 'Perusahaan wajib diisi'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid']
  },
  jenisDokumen: {
    type: String,
    required: [true, 'Jenis dokumen wajib diisi'],
    enum: ['KITAS', 'KITAP', 'IMTA', 'VISA', 'PASSPORT', 'LAINNYA'],
    default: 'KITAS'
  },
  nomorDokumen: {
    type: String,
    required: [true, 'Nomor dokumen wajib diisi'],
    trim: true
  },
  tanggalExpired: {
    type: Date,
    required: [true, 'Tanggal expired wajib diisi']
  },
  tanggalMulai: {
    type: Date,
    required: [true, 'Tanggal mulai wajib diisi']
  },
  masaBerlaku: {
    type: Number, // dalam bulan
    required: true
  },
  status: {
    type: String,
    enum: ['AKTIF', 'EXPIRED', 'PERPANJANG', 'PROSES', 'NONAKTIF'],
    default: 'AKTIF'
  },
  catatan: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index untuk pencarian
recipientSchema.index({ email: 1 });
recipientSchema.index({ tanggalExpired: 1 });
recipientSchema.index({ status: 1 });

// Virtual field untuk menghitung hari sampai expired
recipientSchema.virtual('hariSampaiExpired').get(function() {
  const today = new Date();
  const expDate = new Date(this.tanggalExpired);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method untuk cek status expired
recipientSchema.methods.isExpired = function() {
  return new Date() > new Date(this.tanggalExpired);
};

// Middleware sebelum save
recipientSchema.pre('save', function(next) {
  // Hitung masa berlaku otomatis
  const start = new Date(this.tanggalMulai);
  const end = new Date(this.tanggalExpired);
  const diffTime = end - start;
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  this.masaBerlaku = diffMonths;
  
  next();
});

module.exports = mongoose.model('Recipient', recipientSchema);