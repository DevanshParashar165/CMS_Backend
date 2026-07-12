import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
      lowercase: true,
    },
    registration_number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    gst_number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address1: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    address2: {
      type: String,
      maxlength: 100,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    pin_code: {
      type: String,
      required: true,
      maxlength: 10,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownership_type: {
      type: String,
      enum: ['private', 'government'],
      required: true,
      lowercase: true,
    },
    country_code: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    logo_public_id: {
      type: String,
      default: '',
    },
    settings: {
      type: Object,
      default: {
        appointment_duration: 30,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en',
        notification_preferences: {
          email: true,
          sms: true,
          push: true,
        },
        working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        clinic_timings: {
          start_time: '09:00',
          end_time: '18:00',
        },
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Clinic = mongoose.model('Clinic', clinicSchema);
