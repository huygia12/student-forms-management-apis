import {Request, Response, NextFunction} from "express";
import jwtService from "../services/jwt-service";
import {UserInToken} from "@/common/types";
import {AuthToken, ResponseMessage} from "@/common/constants";
import MissingTokenError from "@/errors/auth/missing-token";
import InvalidTokenError from "@/errors/auth/invalid-token";
import AccessDenided from "@/errors/auth/access-denied";
import {UserRole} from "@prisma/client";

const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string | string[] | undefined =
        req.headers["authorization"];

    checkAuth(accessToken);

    console.debug(`[auth-middleware] Check authorization succeed`);
    next();
};

const checkAuth = (token: string | undefined) => {
    if (typeof token !== "string") {
        console.debug(
            `[auth-middleware] Check authorization failure: missing token`
        );
        throw new MissingTokenError(ResponseMessage.TOKEN_MISSING);
    }

    try {
        jwtService.verifyAuthToken(token.replace("Bearer ", ""), AuthToken.AC);
    } catch {
        console.debug(
            `[auth-middleware]: Check authorization has been failed: invalid token`
        );
        throw new InvalidTokenError(ResponseMessage.TOKEN_INVALID);
    }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken: string | string[] | undefined =
        req.headers["authorization"];

    if (typeof accessToken !== "string") {
        console.debug(
            `[auth-middleware]: Check request from admin has been failed: missing token`
        );
        throw new MissingTokenError(ResponseMessage.TOKEN_MISSING);
    }

    const user = jwtService.decodeToken(
        accessToken.replace("Bearer ", "")
    ) as UserInToken;

    if (user.role !== UserRole.STAFF) {
        console.debug(
            `[auth-middleware] Check request from admin has been failed: access denied`
        );
        throw new AccessDenided(ResponseMessage.ACCESS_DENIED);
    }

    console.debug(`[auth-middleware] Check request from admin succeed`);
    next();
};

export const authMiddleware = {
    isAuthorized,
    isAdmin,
    checkAuth,
};
