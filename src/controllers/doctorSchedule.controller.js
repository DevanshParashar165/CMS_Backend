import { DoctorSchedule } from "../models/doctorSchedule.model";
import { Doctor } from "../models/doctor.model";
import { Clinic } from "../models/clinic.model";
import { User } from "../models/user.model";

export const createDoctorSchedule = async (req, res) => {
    try {
        const { doctor_id, clinic_id, schedule } = req.body;
        if (!doctor_id || !clinic_id || !schedule) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const doctorSchedule = await DoctorSchedule.create({ doctor_id, clinic_id, schedule });
        if (!doctorSchedule) {
            return res.status(400).json({ message: "Doctor schedule not created" })
        }
        return res.status(201).json({ message: "Doctor schedule created successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const updateDoctorSchedule = async (req, res) => {
    try {
        const { doctor_id, clinic_id, schedule } = req.body;
        if (!doctor_id || !clinic_id || !schedule) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const doctorSchedule = await DoctorSchedule.findOne({ doctor_id, clinic_id });
        if (!doctorSchedule) {
            return res.status(400).json({ message: "Doctor schedule not found" })
        }
        doctorSchedule.schedule = schedule;
        await doctorSchedule.save();
        return res.status(200).json({ message: "Doctor schedule updated successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const deleteDoctorSchedule = async (req, res) => {
    try {
        const { doctor_id, clinic_id } = req.params;
        if (!doctor_id || !clinic_id) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const doctorSchedule = await DoctorSchedule.findOne({ doctor_id, clinic_id });
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        await doctorSchedule.deleteOne();
        return res.status(200).json({ message: "Doctor schedule deleted successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctorScheduleByDoctorId = async (req, res) => {
    try {
        const { doctor_id } = req.params;
        if (!doctor_id) {
            return res.status(400).json({ message: "Doctor ID is required" })
        }
        const doctorSchedule = await DoctorSchedule.find({ doctor_id }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctorScheduleByClinicId = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if (!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        const doctorSchedule = await DoctorSchedule.find({ clinic_id }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getTodayDoctorSchedule = async (req, res) => {
    try {
        const { doctor_id } = req.params;
        if (!doctor_id) {
            return res.status(400).json({ message: "Doctor ID is required" })
        }
        const today = new Date().toISOString().split('T')[0];
        const doctorSchedule = await DoctorSchedule.find({ doctor_id, date: today }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctorScheduleByDate = async (req, res) => {
    try {
        const { date } = req.params;
        if (!date) {
            return res.status(400).json({ message: "Date is required" })
        }
        const doctorSchedule = await DoctorSchedule.find({ date }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getAllDoctorSchedules = async (req, res) => {
    try {
        const doctorSchedules = await DoctorSchedule.find().populate("doctor_id").populate("clinic_id");
        if (!doctorSchedules) {
            return res.status(404).json({ message: "Doctor schedules not found" })
        }
        return res.status(200).json({ message: "Doctor schedules fetched successfully", doctorSchedules })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const searchDoctorSchedules = async (req, res) => {
    try {
        const { query } = req.params;
        if (!query) {
            return res.status(400).json({ message: "Query is required" })
        }
        const doctorSchedules = await DoctorSchedule.find({ $or: [{ doctor_id: { $regex: query, $options: "i" } }, { clinic_id: { $regex: query, $options: "i" } }, { date: { $regex: query, $options: "i" } }] }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedules) {
            return res.status(404).json({ message: "Doctor schedules not found" })
        }
        return res.status(200).json({ message: "Doctor schedules fetched successfully", doctorSchedules })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getClinicTodayDoctorSchedule = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if (!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        const today = new Date().toISOString().split('T')[0];
        const doctorSchedule = await DoctorSchedule.find({ clinic_id, date: today }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

const updateClinicTodayDoctorSchedule = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if (!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        const today = new Date().toISOString().split('T')[0];
        const doctorSchedule = await DoctorSchedule.find({ clinic_id, date: today }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        doctorSchedule.schedule = schedule;
        await doctorSchedule.save();
        return res.status(200).json({ message: "Doctor schedule updated successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

const deleteClinicTodayDoctorSchedule = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if (!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        const today = new Date().toISOString().split('T')[0];
        const doctorSchedule = await DoctorSchedule.find({ clinic_id, date: today }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        await doctorSchedule.deleteOne();
        return res.status(200).json({ message: "Doctor schedule deleted successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}
const getClinicDoctorScheduleByDate = async (req, res) => {
    try {
        const { clinic_id, date } = req.params;
        if (!clinic_id || !date) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const doctorSchedule = await DoctorSchedule.find({ clinic_id, date }).populate("doctor_id").populate("clinic_id");
        if (!doctorSchedule) {
            return res.status(404).json({ message: "Doctor schedule not found" })
        }
        return res.status(200).json({ message: "Doctor schedule fetched successfully", doctorSchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getAllClinicDoctorSchedules = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if(!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        const doctorSchedules = await DoctorSchedule.find({ clinic_id }).populate("doctor_id").populate("clinic_id");
        if(!doctorSchedules) {
            return res.status(404).json({ message: "Doctor schedules not found" })
        }
        return res.status(200).json({ message: "Doctor schedules fetched successfully", doctorSchedules })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const searchClinicDoctorSchedules = async (req, res) => {
    try {
        const { query } = req.params;
        if(!query) {
            return res.status(400).json({ message: "Query is required" })
        }
        const doctorSchedules = await DoctorSchedule.find({ $or: [{ doctor_id: { $regex: query, $options: "i" } }, { clinic_id: { $regex: query, $options: "i" } }, { date: { $regex: query, $options: "i" } }] }).populate("doctor_id").populate("clinic_id");
        if(!doctorSchedules) {
            return res.status(404).json({ message: "Doctor schedules not found" })
        }
        return res.status(200).json({ message: "Doctor schedules fetched successfully", doctorSchedules })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getWeeklySchedule = async (req, res) => {
    try {
        const { doctor_id } = req.params;
        if(!doctor_id) {
            return res.status(400).json({ message: "Doctor ID is required" })
        }
        const weeklySchedule = await DoctorSchedule.find({ doctor_id }).populate("doctor_id").populate("clinic_id");
        if(!weeklySchedule) {
            return res.status(404).json({ message: "Weekly schedule not found" })
        }
        return res.status(200).json({ message: "Weekly schedule fetched successfully", weeklySchedule })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}