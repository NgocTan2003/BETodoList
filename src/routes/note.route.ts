import { Router } from "express";
import { getListHandler, createHandler, deleteHandler, updateHandler, searchHandler, updateIsPinned } from "../controllers/note.controller";
import { authenticateToken } from "../middleware/authenToken";
import multer from "multer";
const upload = multer();

const noteRoutes = Router();

noteRoutes.get("/getlist", authenticateToken, getListHandler)
noteRoutes.post("/create", authenticateToken, upload.array('images'), createHandler);
noteRoutes.put("/update/:noteId", authenticateToken, upload.array('images'), updateHandler);
noteRoutes.delete("/delete/:noteId", authenticateToken, deleteHandler)
noteRoutes.get("/search", authenticateToken, searchHandler)
noteRoutes.put("/updatePinned/:noteId", authenticateToken, updateIsPinned)


export default noteRoutes;