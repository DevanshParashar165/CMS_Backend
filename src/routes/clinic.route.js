import router from 'express';
import {
  registerClinic,
  getClinicById,
  getMyClinic,
  getAllClinics,
  updateClinic,
  updateClinicLogo,
  updateClinicStatus,
  deleteClinic,
  restoreClinic,
  getClinicStats,
  getClinicAnalytics,
  checkClinicAvailability,
  updateClinicSettings,
  getClinicSettings,
  transferClinicOwnership,
} from '../controllers/clinic.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { uploadSingleImage } from '../middlewares/multer.middleware.js';

const clinicRouter = router.Router();

clinicRouter.post('/', uploadSingleImage, registerClinic);
clinicRouter.get('/availability', checkClinicAvailability);
clinicRouter.get('/me', authenticate, getMyClinic);
clinicRouter.get('/', authenticate, authorizeRoles('admin', 'superAdmin'), getAllClinics);
clinicRouter.get('/stats/:clinicId', authenticate, authorizeRoles('admin', 'superAdmin'), getClinicStats);
clinicRouter.get('/analytics/:clinicId', authenticate, authorizeRoles('admin', 'superAdmin'), getClinicAnalytics);
clinicRouter.get('/:clinicId/settings', authenticate, getClinicSettings);
clinicRouter.get('/:clinicId', authenticate, getClinicById);
clinicRouter.put('/:clinicId', authenticate, updateClinic);
clinicRouter.patch('/:clinicId/logo', authenticate, authorizeRoles('admin', 'superAdmin'), uploadSingleImage, updateClinicLogo);
clinicRouter.patch('/:clinicId/status', authenticate, authorizeRoles('admin', 'superAdmin'), updateClinicStatus);
clinicRouter.patch('/:clinicId/settings', authenticate, updateClinicSettings);
clinicRouter.patch('/:clinicId/restore', authenticate, authorizeRoles('admin', 'superAdmin'), restoreClinic);
clinicRouter.patch('/:clinicId/transfer-ownership', authenticate, authorizeRoles('admin', 'superAdmin'), transferClinicOwnership);
clinicRouter.delete('/:clinicId', authenticate, authorizeRoles('admin', 'superAdmin'), deleteClinic);

export default clinicRouter;
