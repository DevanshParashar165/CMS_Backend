import router from 'express';
import {
  createAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  deleteAppointment,
  getAppointmentByClinicId,
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const appointmentRouter = router.Router();
appointmentRouter.use(authenticate);

appointmentRouter.post('/', createAppointment);
appointmentRouter.get('/', getAppointments);
appointmentRouter.get('/clinic/:id', getAppointmentByClinicId);
appointmentRouter.get('/:id', getAppointmentById);
appointmentRouter.put('/:id', updateAppointment);
appointmentRouter.delete('/:id', deleteAppointment);
appointmentRouter.patch('/:id/cancel', cancelAppointment);
appointmentRouter.patch('/:id/approve', approveAppointment);

export default appointmentRouter;
