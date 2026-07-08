import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    registration_number : {
        type: String,
        required: true,
        unique: true,
    },
    gst_number : {
        type: String,
        required: true,
        unique: true,
    },
    address1 : {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    address2 : {
        type: String,
        maxlength: 100,
        trim: true
    },
    city : {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    state : {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    country : {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    pin_code : {
        type: String,
        required: true,
        maxlength: 10,
        trim: true
    },
    owner_name : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    ownership_type : {
        type: String,
        enum : ["private","government"],
        required: true,
    },
    country_code : {
        type: String,
        required: true,
    },
    contact_number : {
        type: String,
        required: true,
    },
    is_active : {
        type: Boolean,
        default: true
    }
},{timestamps: true});

export const Clinic = mongoose.model("Clinic", clinicSchema);
