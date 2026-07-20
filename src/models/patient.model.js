import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    clinic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
        required: true
    },
    first_name: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        maxlength: 50,
        trim: true
    },
    contact_number: {
        type: String,
        required: true,
    },
    country_code: {
        type: String,
        required: true,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
    },
    address1: {
        type: String,
        maxlength: 100,
        trim: true
    },
    address2: {
        type: String,
        maxlength: 100,
        trim: true
    },
    city: {
        type: String,
        maxlength: 50,
        trim: true
    },
    state: {
        type: String,
        maxlength: 50,
        trim: true,
    },
    country: {
        type: String,
        maxlength: 50,
        trim: true
    }
}, { timestamps: true });

export const Patient = mongoose.model("Patient", patientSchema);
