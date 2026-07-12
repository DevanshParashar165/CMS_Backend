import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    patient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        required : true
    },
    fileName : {
        type : String,
        required : true,
    },
    fileUrl : {
        type : String,
        required : true,
    },
    documentType : {
        type : String,
        required : true,
    },

},{timestamps : true})

export const Document = mongoose.model("Document", documentSchema);