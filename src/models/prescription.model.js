import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  medications: [
    {
      name: { type: String, required: true, trim: true },
      strength: { type: String, trim: true },
      dose: { type: String, trim: true },
      frequency: { type: String, trim: true },
      duration: { type: String, trim: true },
      instructions: { type: String, trim: true },
    },
  ],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  issued_date: {
    type: Date,
    default: Date.now,
  },
  expires_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
