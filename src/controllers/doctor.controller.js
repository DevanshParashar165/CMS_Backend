import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { Clinic } from "../models/clinic.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";

export const createDoctor = async (req, res) => {
    try {
        const { first_name, last_name, email, password, username, contact_number, country_code, gender, clinic_id, experience, state_registration_number, national_registration_number, consultation_fee, qualification, specialization } = req.body;
        if (!first_name || !last_name || !email || !password || !username || !contact_number || !country_code || !gender || !clinic_id || !experience || !state_registration_number || !national_registration_number || !consultation_fee || !qualification || !specialization) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const clinic = await Clinic.findById(clinic_id);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" })
        }

        const user = await User.create({
            first_name, last_name, email, password, username, contact_number, country_code, gender,
            clinic_id, role: "doctor", last_login: new Date(), is_active: true
        })
        if (!user) {
            return res.status(400).json({ message: "User not created" })
        }
        const doctor = await Doctor.create({ user_id: user._id, clinic_id, experience, state_registration_number, national_registration_number, consultation_fee, qualification, specialization })
        if (!doctor) {
            return res.status(400).json({ message: "Doctor not created" })
        }
        return res.status(201).json({ message: "Doctor created successfully", doctor })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const updateRoleToDoctor = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const user = await User.findById(user_id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (user.role === "doctor") {
            return res.status(409).json({
                message: "User is already a doctor"
            });
        }
        user.role = "doctor";
        await user.save();
        return res.status(200).json({ message: "User updated to doctor successfully", user })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const deleteDoctor = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const user = await User.findById(user_id);
        if (user.role !== "doctor") {
            return res.status(409).json({
                message: "User is not a doctor"
            });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const doctor = await Doctor.findOne({ user_id });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        await doctor.deleteOne();
        user.role = "user";
        await user.save();
        return res.status(200).json({ message: "User deleted successfully", user })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate("user_id").populate("clinic_id");
        return res.status(200).json({ message: "Doctors fetched successfully", doctors })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctorById = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const doctor = await Doctor.findOne({ user_id }).populate("user_id").populate("clinic_id");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" })
        }
        return res.status(200).json({ message: "Doctor fetched successfully", doctor })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}
export const getDoctorsByClinicId = async (req, res) => {
    try {
        const { clinic_id } = req.params;
        if (!clinic_id) {
            return res.status(400).json({ message: "Clinic ID is required" })
        }
        console.log(clinic_id)
        const doctors = await Doctor.find({ clinic_id }).populate("user_id").populate("clinic_id");
        if (!doctors) {
            return res.status(404).json({ message: "Doctors not found" })
        }
        console.log(doctors);
        return res.status(200).json({ message: "Doctors fetched successfully", doctors })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const updateDoctor = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const doctor = await Doctor.findOne({ user_id });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" })
        }
        const { experience, state_registration_number, national_registration_number, consultation_fee, qualification } = req.body;
        doctor.experience = experience;
        doctor.state_registration_number = state_registration_number;
        doctor.national_registration_number = national_registration_number;
        doctor.consultation_fee = consultation_fee;
        doctor.qualification = qualification;
        await doctor.save();
        return res.status(200).json({ message: "Doctor updated successfully", doctor })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getDoctorsByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const doctor = await Doctor.findOne({ user_id }).populate("user_id").populate("clinic_id");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" })
        }
        return res.status(200).json({ message: "Doctor fetched successfully", doctor })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate("user_id").populate("clinic_id");
        if (!doctors) {
            return res.status(404).json({ message: "Doctors not found" })
        }
        return res.status(200).json({ message: "Doctors fetched successfully", doctors })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const searchDoctors = async (req, res) => {
    try {
        const { query } = req.params;
        if (!query) {
            return res.status(400).json({ message: "Query is required" })
        }
        const doctors = await Doctor.find({ $or: [{ first_name: { $regex: query, $options: "i" } }, { last_name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }, { username: { $regex: query, $options: "i" } }, { contact_number: { $regex: query, $options: "i" } }, { country_code: { $regex: query, $options: "i" } }, { gender: { $regex: query, $options: "i" } }, { clinic_id: { $regex: query, $options: "i" } }, { experience: { $regex: query, $options: "i" } }, { state_registration_number: { $regex: query, $options: "i" } }, { national_registration_number: { $regex: query, $options: "i" } }, { consultation_fee: { $regex: query, $options: "i" } }, { qualification: { $regex: query, $options: "i" } }] }).populate("user_id").populate("clinic_id");
        if (!doctors) {
            return res.status(404).json({ message: "Doctors not found" })
        }
        return res.status(200).json({ message: "Doctors fetched successfully", doctors })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
}

export const getTotalSpecialtiesByClinic = async (req, res) => {
    try {
        const { clinic_id } = req.params;

        const specialties = await Doctor.distinct("specialization", {
            clinic_id,
        });

        return res.status(200).json({
            message: "Specialties fetched successfully",
            totalSpecialties: specialties.length,
            specialties,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};
