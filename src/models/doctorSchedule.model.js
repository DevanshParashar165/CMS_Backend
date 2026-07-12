import mongoose from 'mongoose'

const doctorScheduleSchema = new mongoose.Schema({
    doctor_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    day_of_week : {
        type: String,
        enum : ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
        required: true,
    },
    startTime : {
        type: String,
        required: true,
    },
    endTime : {
        type : String,
        required: true,
    },
    maxAppointmentPerDay : {
        type: Number,
        required: true,
    }
},{timestamps: true})

export const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);