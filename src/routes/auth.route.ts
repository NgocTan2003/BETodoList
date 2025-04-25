import { Router } from "express";
import { registerHandler, loginHandler, getUserInfoHandler, logoutHandler, refreshHandler, verifyHandler, sendMailHandler } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/authenToken";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/info", authenticateToken, getUserInfoHandler);
authRoutes.post("/refresh", refreshHandler);
authRoutes.post("/email/verify/:code", verifyHandler);
authRoutes.get("/email/verify/:code", verifyHandler);
authRoutes.get("/email/send/:email", sendMailHandler);


export default authRoutes;