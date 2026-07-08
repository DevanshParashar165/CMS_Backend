import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    clinic_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic"
    },
    doctor_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    patient_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    appointment_date : {
        type: Date,
        required: true
    },
    appointment_time : {
        type: String,
        required: true
    },
    appointment_type : {
        type: String,
        enum : ["online","offline","followup"],
    },
    appointment_status : {
        type: String,
        enum : ["pending","confirmed","cancelled","completed","noShow"],
        default: "pending"
    },
    notes : {
        type: String,
        maxlength: 500,
        trim: true
    },
    prescription : {
        type: String,
        maxlength: 500,
        trim: true
    }
},{timestamps: true});

export const Appointment = mongoose.model("Appointment", appointmentSchema);