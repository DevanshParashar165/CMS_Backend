import router from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientsByClinic,
  createMedicalHistory,
  getMedicalHistories,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} from '../controllers/patient.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const patientRouter = router.Router();

patientRouter.use(authenticate);

patientRouter.post('/', createPatient);
patientRouter.get('/', getAllPatients);
patientRouter.get('/search', searchPatients);
patientRouter.get('/clinic/:clinicId', getPatientsByClinic);
patientRouter.get('/:id', getPatientById);
patientRouter.put('/:id', updatePatient);
patientRouter.delete('/:id', deletePatient);

patientRouter.post('/:patientId/medical-history', createMedicalHistory);
patientRouter.get('/:patientId/medical-history', getMedicalHistories);
patientRouter.get('/:patientId/medical-history/:historyId', getMedicalHistoryById);
patientRouter.put('/:patientId/medical-history/:historyId', updateMedicalHistory);
patientRouter.delete('/:patientId/medical-history/:historyId', deleteMedicalHistory);

patientRouter.post('/:patientId/prescriptions', createPrescription);
patientRouter.get('/:patientId/prescriptions', getPrescriptions);
patientRouter.get('/:patientId/prescriptions/:prescriptionId', getPrescriptionById);
patientRouter.put('/:patientId/prescriptions/:prescriptionId', updatePrescription);
patientRouter.delete('/:patientId/prescriptions/:prescriptionId', deletePrescription);

patientRouter.post('/:patientId/reports', createReport);
patientRouter.get('/:patientId/reports', getReports);
patientRouter.get('/:patientId/reports/:reportId', getReportById);
patientRouter.put('/:patientId/reports/:reportId', updateReport);
patientRouter.delete('/:patientId/reports/:reportId', deleteReport);

export default patientRouter;
