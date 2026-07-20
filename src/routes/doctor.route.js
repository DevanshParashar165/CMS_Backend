import express from "express";
import {
    createDoctor,
    updateRoleToDoctor,
    getDoctors,
    getDoctorById,
    getDoctorsByClinicId,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
    getTotalSpecialtiesByClinic,
} from "../controllers/doctor.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const doctorRouter = express.Router();

doctorRouter.post(
    "/",
    authenticate,
    authorizeRoles("admin", "super_admin"),
    createDoctor
);

doctorRouter.get(
    "/",
    authenticate,
    getDoctors
);

doctorRouter.get(
    "/search/:query",
    authenticate,
    searchDoctors
);

doctorRouter.get(
    "/clinic/:clinic_id",
    authenticate,
    getDoctorsByClinicId
);

doctorRouter.get(
    "/:user_id",
    authenticate,
    getDoctorById
);

doctorRouter.put(
    "/:user_id",
    authenticate,
    authorizeRoles("admin", "super_admin"),
    updateDoctor
);

doctorRouter.patch(
    "/role/:user_id",
    authenticate,
    authorizeRoles("admin", "super_admin"),
    updateRoleToDoctor
);

doctorRouter.delete(
    "/:user_id",
    authenticate,
    authorizeRoles("admin", "super_admin"),
    deleteDoctor
);

doctorRouter.get("/specialities/:clinic_id", authenticate, getTotalSpecialtiesByClinic)

export default doctorRouter;