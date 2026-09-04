import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: null
  },
  lastSeen: {
    type: Date,
    default: new Date()
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  pushToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
