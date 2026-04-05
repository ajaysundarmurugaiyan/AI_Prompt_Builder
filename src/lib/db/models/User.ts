import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [60, 'Name cannot be more than 60 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  groqApiKey: {
    type: String,
    required: [true, 'Please provide a Groq API Key.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
