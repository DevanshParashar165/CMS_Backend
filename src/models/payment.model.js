import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    billing_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Billing"
    },
    amount : {
        type: Number,
        required: true,
    },
    payment_method : {
        type: String,
        enum : ["cash","card","upi","wallet"],
    },
    transaction_id : {
        type: String,
        required: true,
    }
},{timestamps: true});

export const Payment = mongoose.model("Payment", paymentSchema);