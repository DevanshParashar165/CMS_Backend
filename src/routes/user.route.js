import router from "express";
import {registerUser, loginUser, logoutUser} from "../controllers/user.controller.js";

const userRouter = router.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

export default userRouter;