import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../constants/env";
import { UNAUTHORIZED, FORBIDDEN } from "../constants/http"
import { RefreshToken } from "../services/auth.service";
import { TokenExpiredError } from "jsonwebtoken";
import { setAuthCookies } from "../utils/cookies";
const jwt = require('jsonwebtoken');

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.sendStatus(UNAUTHORIZED);
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded.user;
        next();
    } catch (err: any) {
        if (err instanceof TokenExpiredError) {
            const result = await RefreshToken(req);

            if (result.accessToken && result.refreshToken) {
                setAuthCookies({
                    res,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                });

                const newDecoded: any = jwt.decode(result.accessToken);
                (req as any).user = newDecoded?.user;

                return next();
            }

            return res.status(result.errorCode || UNAUTHORIZED).json({ message: result.message });
        }

        return res.status(FORBIDDEN).json({ message: "Invalid access token" });
    }
};

export { authenticateToken };