import { z } from "zod";
import { CreateAccount, Login, RefreshToken, VerifyEmail, SendMail } from "../services/auth.service"
import { CREATED, OK } from "../constants/http";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schemas";

const registerHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const request = registerSchema.parse({
            ...req.body,
            userAgent: req.headers["user-agent"],
        });

        const response = await CreateAccount(request);

        if (response.errorCode || !response.accessToken || !response.refreshToken) {
            return res.status(response.errorCode || 500).json({
                message: response.message,
            });
        }

        const { user, accessToken, refreshToken, message } = response;
        setAuthCookies({ res, accessToken, refreshToken })
            .status(CREATED).json({ "accessToken": accessToken, "refreshToken": refreshToken, "message": message, "statuscode": OK });
        return res.status(200).json({
            statusCode: CREATED,
            message: "Registered successfully"
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ messages });
        }
        throw error;
    }
}

const loginHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const request = loginSchema.parse({
            ...req.body,
            userAgent: req.headers["user-agent"],
        })

        const response = await Login(request);

        if (response.errorCode || !response.accessToken || !response.refreshToken) {
            return res.status(response.errorCode || 500).json({
                errorCode: response.errorCode,
                message: response.message,
            });
        }

        const { accessToken, refreshToken, message } = response;

        if (accessToken && refreshToken) {
            return setAuthCookies({ res, accessToken, refreshToken })
                .status(OK)
                .json({ "accessToken": accessToken, "refreshToken": refreshToken, "message": message, "statuscode": OK });
        } else {
            return res.status(500).json({ message: "Missing tokens" });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ messages });
        }
        throw error;
    }
}

const logoutHandler = async (req: Request, res: Response): Promise<any> => {
    return clearAuthCookies(res).status(OK).json({
        message: "Logged out successfully"
    });
}

const refreshHandler = async (req: Request, res: Response): Promise<any> => {
    const response = await RefreshToken(req);

    if (response.errorCode || !response.accessToken || !response.refreshToken) {
        return res.status(response.errorCode || 500).json({
            errorCode: response.errorCode,
            message: response.message,
        });
    }

    const { accessToken, refreshToken, message } = response;

    if (accessToken && refreshToken) {
        return setAuthCookies({ res, accessToken, refreshToken })
            .status(CREATED)
            .json({ accessToken, refreshToken, message });
    } else {
        return res.status(500).json({ message: "Missing tokens" });
    }
}

const verifyHandler = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.code;
    const response = await VerifyEmail(id);

    if (response.errorCode) {
        return res.status(response.errorCode || 500).json({
            errorCode: response.errorCode,
            message: response.message,
        });
    } else {
        return res.status(OK).json({
            statusCode: OK,
            message: response.message
        })
    }
}

const sendMailHandler = async (req: Request, res: Response): Promise<any> => {
    const email = req.params.email;
    const response = await SendMail(email);

    if (response.errorCode) {
        return res.status(response.errorCode || 500).json({
            errorCode: response.errorCode,
            message: response.message,
        });
    } else {
        return res.status(OK).json({
            statusCode: OK,
            message: response.message
        })
    }
}


export { registerHandler, loginHandler, logoutHandler, refreshHandler, verifyHandler, sendMailHandler }

