import { UserDocument } from "../models/user.model"
import VerificationCodeModel from "../models/verificationCode.model"
import VerificationCodeType from "../constants/verificationCodeType"
import jwt from "jsonwebtoken"
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env"
import { CONFLICT, FORBIDDEN, NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from "../constants/http"
import { request, Request } from "express"
import UserModel from "../models/user.model"
import { sendMail } from "./mail.service"
import { getVerifyEmailTemplate } from '../utils/emailTemplates'
import { APP_ORIGIN, APP_DOMAIN } from '../constants/env'

type CreateAccountRequest = {
    fullName: string,
    email: string,
    password: string,
    userAgent?: string
}

type LoginRequest = {
    email: string,
    password: string,
    userAgent?: string
}

type AuthResponse = {
    user?: UserDocument,
    accessToken?: string,
    refreshToken?: string,
    message: string,
    errorCode?: number
}

const CreateAccount = async (request: CreateAccountRequest): Promise<AuthResponse> => {
    const existingUser = await UserModel.exists({ email: request.email });
    if (existingUser) {
        return ({
            message: "Email already exists",
            errorCode: CONFLICT,
        })
    }

    const user = await UserModel.create({
        fullName: request.fullName,
        email: request.email,
        password: request.password
    })

    const verificationCode = await VerificationCodeModel.create({
        userId: user._id,
        type: VerificationCodeType.EmailVerification,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour 
    })

    const verificationUrl = `${APP_DOMAIN}/auth/email/verify/${verificationCode._id}`;
    const to: string = user.email;

    const { subject, html } = getVerifyEmailTemplate(verificationUrl);

    sendMail(to, subject, html);

    return ({
        message: "User created successfully and verification email sent",
    });
}

const Login = async (request: LoginRequest): Promise<AuthResponse> => {
    const user = await UserModel.findOne({ email: request.email });

    if (!user) {
        return ({
            message: "Not Found Email",
            errorCode: NOT_FOUND,
        })
    }

    const isPasswordValid = await user.comparePassword(request.password);
    if (isPasswordValid) {
        return ({
            message: "Invalid password",
            errorCode: UNAUTHORIZED,
        })
    }

    if (!user.verified) {
        return ({
            message: "Unverified Account",
            errorCode: FORBIDDEN,
        })
    }

    const accessToken = jwt.sign({ user: user.omitPassword() }, JWT_SECRET, {
        audience: ["user"],
        expiresIn: "1m",
    });

    const refreshToken = jwt.sign({ user: user.omitPassword() }, JWT_REFRESH_SECRET, {
        audience: ["user"],
        expiresIn: "10m",
    });

    return {
        accessToken,
        refreshToken,
        message: "User logged in successfully",
    };
}

const RefreshToken = async (request: Request): Promise<AuthResponse> => {
    const refreshToken = request.cookies.refreshToken;
    const accessToken = request.cookies.accessToken;

    console.log("Refresh -----------------------------")
    if (!refreshToken || !accessToken) {
        return {
            message: "Unauthorized"
        }
    }

    const now = Math.floor(Date.now() / 1000);
    try {
        const decodedAccess = jwt.decode(accessToken) as jwt.JwtPayload;
        if (decodedAccess?.exp && decodedAccess.exp > now) {
            return {
                message: "AccessToken not expired",
                errorCode: FORBIDDEN
            }
        }

        const decodedRefresh = jwt.decode(refreshToken) as jwt.JwtPayload;
        if (!decodedRefresh?.exp || decodedRefresh.exp < now) {
            return {
                message: "RefreshToken expired",
                errorCode: UNAUTHORIZED
            }
        }

        const verified = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;
        const userData = verified.user;

        if (!userData?.email) {
            return {
                message: "Invalid token payload",
                errorCode: UNAUTHORIZED
            }
        }

        const user = await UserModel.findOne({ email: userData.email });
        if (!user) {
            return {
                message: "User not found",
                errorCode: UNAUTHORIZED
            }
        }

        const newAccessToken = jwt.sign(
            { user: user.omitPassword() },
            JWT_SECRET,
            { audience: ["user"], expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { user: user.omitPassword() },
            JWT_REFRESH_SECRET,
            { audience: ["user"], expiresIn: "30m" }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            message: "Refresh successfully",
        };
    } catch (error) {
        return {
            message: error instanceof Error ? error.message : String(error),
            errorCode: INTERNAL_SERVER_ERROR
        }
    }
};

const VerifyEmail = async (id: string): Promise<AuthResponse> => {
    const validCode = await VerificationCodeModel.findOne({ _id: id })

    if (!validCode) {
        return ({
            errorCode: NOT_FOUND,
            message: "Note Found"
        })
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
        validCode.userId,
        {
            verified: true
        }, {
        new: true
    })

    if (!updatedUser) {
        return ({
            errorCode: INTERNAL_SERVER_ERROR,
            message: "Verify Fail"
        })
    }

    await validCode.deleteOne();

    return {
        message: "Verify success"
    }
}

const SendMail = async (email: string): Promise<AuthResponse> => {
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
        return ({
            message: "Not found email",
            errorCode: NOT_FOUND,
        })
    }
    const verificationCode = await VerificationCodeModel.findOne({ userId: existingUser._id });

    if (verificationCode) {
        const verificationUrl = `${APP_ORIGIN}/auth/email/verify/${verificationCode._id}`;
        const to: string = existingUser.email;
        const { subject, html } = getVerifyEmailTemplate(verificationUrl);

        sendMail(to, subject, html);
    } else {
        return ({
            errorCode: NOT_FOUND,
            message: "Not found verificationCode"
        })
    }

    return ({
        message: "SendMail Success"
    })
}


export { CreateAccount, Login, RefreshToken, VerifyEmail, SendMail }