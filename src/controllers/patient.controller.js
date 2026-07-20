import mongoose from 'mongoose';
import { Patient } from '../models/patient.model.js';
import { MedicalHistory } from '../models/medicalHistory.model.js';
import { Prescription } from '../models/prescription.model.js';
import { Report } from '../models/report.model.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPatientFilter = (query) => {
  const filter = {};

  if (query.clinic_id && isValidObjectId(query.clinic_id)) {
    filter.clinic_id = query.clinic_id;
  }
  if (query.gender) {
    filter.gender = query.gender.toLowerCase();
  }
  if (query.city) {
    filter.city = query.city;
  }
  if (query.state) {
    filter.state = query.state;
  }
  if (query.country) {
    filter.country = query.country;
  }

  return filter;
};

export const createPatient = async (req, res) => {
  try {
    const {
      clinic_id,
      first_name,
      last_name,
      email,
      contact_number,
      country_code,
      date_of_birth,
      gender,
      address1,
      address2,
      city,
      state,
      country,
    } = req.body;

    if (
      !clinic_id ||
      !first_name ||
      !last_name ||
      !contact_number ||
      !country_code ||
      !gender ||
      !country
    ) {
      return res.status(400).json({ success: false, message: 'Missing required patient fields' });
    }

    if (!isValidObjectId(clinic_id)) {
      return res.status(400).json({ success: false, message: 'Invalid clinic ID' });
    }

    const existingPatient = await Patient.findOne({ email: email.toLowerCase().trim() });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Patient email already exists' });
    }

    const patient = await Patient.create({
      clinic_id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      contact_number,
      country_code,
      date_of_birth,
      gender: gender.toLowerCase(),
      address1: address1.trim(),
      address2: address2 ? address2.trim() : undefined,
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
    });

    return res.status(201).json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const filter = buildPatientFilter(req.query);
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    const updateData = { ...req.body };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.first_name) {
      updateData.first_name = updateData.first_name.trim();
    }
    if (updateData.last_name) {
      updateData.last_name = updateData.last_name.trim();
    }
    if (updateData.address1) {
      updateData.address1 = updateData.address1.trim();
    }
    if (updateData.address2) {
      updateData.address2 = updateData.address2.trim();
    }
    if (updateData.city) {
      updateData.city = updateData.city.trim();
    }
    if (updateData.state) {
      updateData.state = updateData.state.trim();
    }
    if (updateData.country) {
      updateData.country = updateData.country.trim();
    }
    if (updateData.gender) {
      updateData.gender = updateData.gender.toLowerCase();
    }

    if (updateData.clinic_id && !isValidObjectId(updateData.clinic_id)) {
      return res.status(400).json({ success: false, message: 'Invalid clinic ID' });
    }

    const patient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const patients = await Patient.find({
      $or: [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
        { contact_number: regex },
        { city: regex },
        { state: regex },
        { country: regex },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientsByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    if (!isValidObjectId(clinicId)) {
      return res.status(400).json({ success: false, message: 'Invalid clinic ID' });
    }

    const patients = await Patient.find({ clinic_id: clinicId })
      .populate('clinic_id', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ensurePatientExists = async (patientId, res) => {
  if (!isValidObjectId(patientId)) {
    res.status(400).json({ success: false, message: 'Invalid patient ID' });
    return null;
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return null;
  }

  return patient;
};

export const createMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const { condition, diagnosis_date, notes, medications, allergies, surgeries, family_history } = req.body;
    if (!condition) {
      return res.status(400).json({ success: false, message: 'Condition is required' });
    }

    const medicalHistory = await MedicalHistory.create({
      patient_id: patientId,
      condition: condition.trim(),
      diagnosis_date,
      notes: notes?.trim(),
      medications,
      allergies,
      surgeries,
      family_history: family_history?.trim(),
    });

    return res.status(201).json({ success: true, data: medicalHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicalHistories = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const histories = await MedicalHistory.find({ patient_id: patientId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicalHistoryById = async (req, res) => {
  try {
    const { patientId, historyId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(historyId)) {
      return res.status(400).json({ success: false, message: 'Invalid history ID' });
    }

    const history = await MedicalHistory.findOne({ _id: historyId, patient_id: patientId });
    if (!history) {
      return res.status(404).json({ success: false, message: 'Medical history record not found' });
    }

    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId, historyId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(historyId)) {
      return res.status(400).json({ success: false, message: 'Invalid history ID' });
    }

    const updateData = { ...req.body };
    if (updateData.condition) updateData.condition = updateData.condition.trim();
    if (updateData.notes) updateData.notes = updateData.notes.trim();
    if (updateData.family_history) updateData.family_history = updateData.family_history.trim();

    const history = await MedicalHistory.findOneAndUpdate(
      { _id: historyId, patient_id: patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!history) {
      return res.status(404).json({ success: false, message: 'Medical history record not found' });
    }

    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedicalHistory = async (req, res) => {
  try {
    const { patientId, historyId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(historyId)) {
      return res.status(400).json({ success: false, message: 'Invalid history ID' });
    }

    const history = await MedicalHistory.findOneAndDelete({ _id: historyId, patient_id: patientId });
    if (!history) {
      return res.status(404).json({ success: false, message: 'Medical history record not found' });
    }

    return res.status(200).json({ success: true, message: 'Medical history deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const { doctor_id, appointment_id, medications, notes, expires_date, status } = req.body;
    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medication is required' });
    }

    const prescription = await Prescription.create({
      patient_id: patientId,
      doctor_id,
      appointment_id,
      medications,
      notes: notes?.trim(),
      expires_date,
      status,
    });

    return res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const prescriptions = await Prescription.find({ patient_id: patientId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(prescriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid prescription ID' });
    }

    const prescription = await Prescription.findOne({ _id: prescriptionId, patient_id: patientId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(prescriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid prescription ID' });
    }

    const updateData = { ...req.body };
    if (updateData.notes) updateData.notes = updateData.notes.trim();

    const prescription = await Prescription.findOneAndUpdate(
      { _id: prescriptionId, patient_id: patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(prescriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid prescription ID' });
    }

    const prescription = await Prescription.findOneAndDelete({ _id: prescriptionId, patient_id: patientId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const { report_type, description, file_url, issued_by, issued_date, status } = req.body;
    if (!report_type) {
      return res.status(400).json({ success: false, message: 'Report type is required' });
    }

    const report = await Report.create({
      patient_id: patientId,
      report_type: report_type.trim(),
      description: description?.trim(),
      file_url: file_url?.trim(),
      issued_by: issued_by?.trim(),
      issued_date,
      status,
    });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;

    const reports = await Report.find({ patient_id: patientId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { patientId, reportId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID' });
    }

    const report = await Report.findOne({ _id: reportId, patient_id: patientId });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { patientId, reportId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID' });
    }

    const updateData = { ...req.body };
    if (updateData.report_type) updateData.report_type = updateData.report_type.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.file_url) updateData.file_url = updateData.file_url.trim();
    if (updateData.issued_by) updateData.issued_by = updateData.issued_by.trim();

    const report = await Report.findOneAndUpdate(
      { _id: reportId, patient_id: patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { patientId, reportId } = req.params;
    const patient = await ensurePatientExists(patientId, res);
    if (!patient) return;
    if (!isValidObjectId(reportId)) {
      return res.status(400).json({ success: false, message: 'Invalid report ID' });
    }

    const report = await Report.findOneAndDelete({ _id: reportId, patient_id: patientId });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
