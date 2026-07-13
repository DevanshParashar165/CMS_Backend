import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./src/config/db.js";
import userRouter from "./src/routes/user.route.js";
import patientRouter from "./src/routes/patient.route.js";
import appointmentRouter from "./src/routes/appointment.route.js";
import clinicRouter from "./src/routes/clinic.route.js";
import doctorRouter from "./src/routes/doctor.route.js";

dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

await connectDB();
console.log("Database connected successfully");

app.get("/", (req, res) => {
    res.json({ message: "Web App is running successfully" });
});

//Routes

app.use("/api/users", userRouter);
app.use("/api/patients", patientRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/clinics", clinicRouter);
app.use("/api/doctor",doctorRouter)


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});