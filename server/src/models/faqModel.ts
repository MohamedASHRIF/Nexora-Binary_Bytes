import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'transportation', 'events', 'food'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
faqSchema.index({ question: 'text', answer: 'text' });

export const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema); 