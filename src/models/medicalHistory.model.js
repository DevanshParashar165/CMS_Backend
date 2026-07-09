import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  condition: {
    type: String,
    trim: true,
    required: true,
  },
  diagnosis_date: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  medications: [
    {
      name: { type: String, trim: true },
      dose: { type: String, trim: true },
      frequency: { type: String, trim: true },
      duration: { type: String, trim: true },
    },
  ],
  allergies: [
    {
      type: String,
      trim: true,
    },
  ],
  surgeries: [
    {
      type: String,
      trim: true,
    },
  ],
  family_history: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, { timestamps: true });

export const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
