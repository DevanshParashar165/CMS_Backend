import mongoose from 'mongoose';
import { Appointment } from '../models/appointment.model.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const validTypes = ['online', 'offline', 'followup'];
const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'noShow'];

const validateAppointmentPayload = ({ clinic_id, doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_status }) => {
  if (!clinic_id || !doctor_id || !patient_id || !appointment_date || !appointment_time) {
    return 'clinic_id, doctor_id, patient_id, appointment_date and appointment_time are required';
  }

  if (![clinic_id, doctor_id, patient_id].every(isValidObjectId)) {
    return 'clinic_id, doctor_id and patient_id must be valid MongoDB IDs';
  }

  if (appointment_type && !validTypes.includes(appointment_type)) {
    return 'appointment_type must be one of: ' + validTypes.join(', ');
  }

  if (appointment_status && !validStatuses.includes(appointment_status)) {
    return 'appointment_status must be one of: ' + validStatuses.join(', ');
  }

  return null;
};

const buildAppointmentFilter = (query) => {
  const filter = {};

  if (query.clinic_id && isValidObjectId(query.clinic_id)) {
    filter.clinic_id = query.clinic_id;
  }
  if (query.doctor_id && isValidObjectId(query.doctor_id)) {
    filter.doctor_id = query.doctor_id;
  }
  if (query.patient_id && isValidObjectId(query.patient_id)) {
    filter.patient_id = query.patient_id;
  }
  if (query.appointment_type && validTypes.includes(query.appointment_type)) {
    filter.appointment_type = query.appointment_type;
  }
  if (query.appointment_status && validStatuses.includes(query.appointment_status)) {
    filter.appointment_status = query.appointment_status;
  }

  if (query.start_date || query.end_date) {
    filter.appointment_date = {};
    if (query.start_date) filter.appointment_date.$gte = new Date(query.start_date);
    if (query.end_date) filter.appointment_date.$lte = new Date(query.end_date);
  }

  return filter;
};

export const createAppointment = async (req, res) => {
  try {
    const validationError = validateAppointmentPayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const appointment = await Appointment.create(req.body);
    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const filter = buildAppointmentFilter(req.query);
    const appointments = await Appointment.find(filter).sort({ appointment_date: 1, appointment_time: 1 });
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    if (req.body.appointment_type && !validTypes.includes(req.body.appointment_type)) {
      return res.status(400).json({ success: false, message: 'appointment_type must be one of: ' + validTypes.join(', ') });
    }
    if (req.body.appointment_status && !validStatuses.includes(req.body.appointment_status)) {
      return res.status(400).json({ success: false, message: 'appointment_status must be one of: ' + validStatuses.join(', ') });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changeAppointmentStatus = async (id, appointment_status, res) => {
  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
  }

  if (!validStatuses.includes(appointment_status)) {
    return res.status(400).json({ success: false, message: 'Appointment status must be one of: ' + validStatuses.join(', ') });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { appointment_status },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  return res.status(200).json({ success: true, data: appointment });
};

export const cancelAppointment = async (req, res) => {
  try {
    return await changeAppointmentStatus(req.params.id, 'cancelled', res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveAppointment = async (req, res) => {
  try {
    return await changeAppointmentStatus(req.params.id, 'confirmed', res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmAppointment = async (req, res) => {
  try {
    return await changeAppointmentStatus(
      req.params.id,
      "confirmed",
      res
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};