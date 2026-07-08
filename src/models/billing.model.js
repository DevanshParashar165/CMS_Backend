import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
    clinic_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic"
    },
    appointment_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    total_amount : {
        type: Number,
        required: true
    },
    discount_amount : {
        type: Number,
        default: 0
    },
    tax_amount : {
        type: Number,
        default: 0
    },
    net_amount : {
        type: Number,
        required: true
    },
    payment_status : {
        type: String,
        enum : ["pending","paid","failed","partial"]
    }
},{timestamps: true});

export const Billing = mongoose.model("Billing", billingSchema);