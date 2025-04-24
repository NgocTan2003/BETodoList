import { Router } from "express";
import { registerHandler, loginHandler, logoutHandler, refreshHandler, verifyHandler, sendMailHandler } from "../controllers/auth.controller";


const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.post("/refresh", refreshHandler);
authRoutes.post("/email/verify/:code", verifyHandler);
authRoutes.get("/email/verify/:code", verifyHandler);
authRoutes.get("/email/send/:email", sendMailHandler);


export default authRoutes;