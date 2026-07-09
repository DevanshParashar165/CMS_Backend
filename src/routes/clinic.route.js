import router from 'express';
import { registerClinic } from '../controllers/clinic.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const clinicRouter = router.Router();
clinicRouter.use(authenticate);

clinicRouter.post('/', registerClinic);

export default clinicRouter;
