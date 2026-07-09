import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  report_type: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  file_url: {
    type: String,
    trim: true,
  },
  issued_by: {
    type: String,
    trim: true,
  },
  issued_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'reviewed'],
    default: 'pending',
  },
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
