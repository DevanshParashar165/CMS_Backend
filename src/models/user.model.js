import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    clinic_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
    },
    role : {
        type: String,
        enum: ["superAdmin","admin", "doctor", "staff"],
        default: "staff"
    },
    first_name : {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    last_name : {
        type: String,
        maxlength: 50,
        trim: true,
        default : ""
    },
    username : {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
        trim: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
        trim: true
    },
    password : {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    contact_number : {
        type: String,
    },
    country_code : {
        type: String,
    },
    date_of_birth : {
        type: Date,
    },
    gender : {
        type: String,
        enum : ["male","female","other"],
    },
    address1 : {
        type: String,
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
        maxlength: 50,
        trim: true
    },
    state : {
        type: String,
        maxlength: 50,
        trim: true,
    },
    country : {
        type: String,
        maxlength: 50,
        trim: true
    },
    is_active : {
        type: Boolean,
        default: true
    },
    last_login : {
        type: Date,
        default: null
    },
    refreshToken : {
        type: String,
        default: null
    }
},{timestamps: true});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);