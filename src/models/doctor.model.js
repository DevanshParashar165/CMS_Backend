import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    qualification : {
        type: String,
        required: true,
    },
    experience : {
        type: Number,
        required: true,
    },
    state_registration_number : {
        type: String,
        required: true,
    },
    national_registration_number : {
        type: String,
        required: true,
    },
    consultation_fee : {
        type: Number,
        required: true,
    }
},{timestamps: true});

export const Doctor = mongoose.model("Doctor", doctorSchema);