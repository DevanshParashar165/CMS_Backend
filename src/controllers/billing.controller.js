import mongoose from "mongoose";
import { Billing } from "../models/billing.model.js";

export const getTodayBillingByClinicId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid clinic ID is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bills = await Billing.find({
            clinic_id: id,
            createdAt: {
                $gte: today,
                $lt: tomorrow,
            },
        }).populate("appointment_id");

        return res.status(200).json({
            success: true,
            message: 'Today bills fetched successfully',
            data: bills,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
