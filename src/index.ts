import "dotenv/config"
import express from "express";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, PORT } from "./constants/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import noteRoutes from "./routes/note.route";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }))
app.use(
    cors({
        origin: APP_ORIGIN,
        credentials: true,
    })
);

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello World! 123");
});

app.use("/auth", authRoutes)
app.use("/note", noteRoutes)

app.listen(Number(PORT), "0.0.0.0", async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectToDatabase();
});