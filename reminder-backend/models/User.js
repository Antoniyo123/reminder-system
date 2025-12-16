// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid']
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'],
    default: 'USER'
  },
  status: {
    type: String,
    enum: ['AKTIF', 'NONAKTIF'],
    default: 'AKTIF'
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password sebelum save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual untuk hide password di JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);