import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import jwtService from "@/services/jwt-service";
import userService from "@/services/user-service";
import {
    AdminSignup,
    AdminLogin,
    AdminUpdate,
    StudentSignup,
    StudentLogin,
    StudentUpdate,
} from "@/common/schemas";
import {StudentDTO, UserInToken} from "@/common/types";
import {AuthToken, ResponseMessage} from "@/common/constants";
import MissingTokenError from "@/errors/auth/missing-token";
import ms from "ms";
import UserNotFoundError from "@/errors/user/user-not-found";

/**
 * If updated email had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const signupAsAdmin = async (req: Request, res: Response) => {
    const reqBody = req.body as AdminSignup;

    await userService.insertAdmin(reqBody);

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
    });
};

/**
 * If not, create tokens and send back in header and cookie
 *
 * @param {Request} req
 * @param {Response} res
 */
const loginAsAdmin = async (req: Request, res: Response) => {
    const loginReq = req.body as AdminLogin;
    const rtInCookie = req.cookies.refreshToken as string | undefined;

    const {refreshToken, accessToken} = await userService.loginAsAdmin(
        rtInCookie,
        loginReq
    );

    //set token to cookie
    res.cookie(AuthToken.RF, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: accessToken,
        },
    });
};

/**
 * Make new access token. Also checking if DB is containing this refresh token or not
 * If not, then clear all the refresh token in the DB and admin must login again for new valid refresh token
 *
 * @param {Request} req
 * @param {Response} res
 */
const refreshAdminToken = async (req: Request, res: Response) => {
    const rtFromCookie = req.cookies.refreshToken as string;

    if (!rtFromCookie) {
        console.debug(
            `[user controller]: refresh token: Refresh token not found`
        );
        throw new MissingTokenError(ResponseMessage.TOKEN_MISSING);
    }

    const tokens = await userService.refreshAdminToken(rtFromCookie);
    //set two token to cookie
    res.cookie(AuthToken.RF, tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });
    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: tokens.accessToken,
        },
    });
};

/**
 * Log admin out, clear admin's token
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const logoutAsAdmin = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
        const user = jwtService.decodeToken(refreshToken) as UserInToken;

        await userService.logoutAsAdmin(refreshToken, user.userId);
    }

    res.removeHeader("Authorization");
    res.clearCookie(AuthToken.RF);
    res.status(StatusCodes.OK).json({message: ResponseMessage.SUCCESS});
};

const deleteAdmin = async (req: Request, res: Response) => {
    const adminId = req.params.id as string;

    await userService.deleteAdmin(adminId);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const getAdmin = async (req: Request, res: Response) => {
    const adminId = req.params.id as string;

    const admin = await userService.getAdminDTO(adminId);

    if (!admin) throw new UserNotFoundError(ResponseMessage.USER_NOT_FOUND);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: admin,
    });
};

/**
 * If updated email had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateAdminInfo = async (req: Request, res: Response) => {
    const adminId = req.params.id as string;
    const reqBody = req.body as AdminUpdate;

    await userService.updateAdmin(adminId, reqBody);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

/**
 * If updated username had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const signupAsStudent = async (req: Request, res: Response) => {
    const reqBody = req.body as StudentSignup;

    await userService.insertStudents(reqBody);

    res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
    });
};

/**
 * Log use in the user
 * If not, create tokens and send back in header and cookie
 *
 * @param {Request} req
 * @param {Response} res
 */
const loginAsStudent = async (req: Request, res: Response) => {
    const reqBody = req.body as StudentLogin;
    const rtInCookie = req.cookies.refreshToken as string | undefined;

    const {refreshToken, accessToken} = await userService.loginAsStudent(
        rtInCookie,
        reqBody
    );

    //set token to cookie
    res.cookie(AuthToken.RF, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: accessToken,
        },
    });
};

/**
 * Log student out, clear student's token
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const logoutAsStudent = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (refreshToken) {
        const user = jwtService.decodeToken(refreshToken) as UserInToken;

        await userService.logoutAsStudent(refreshToken, user.userId);
    }

    res.removeHeader("Authorization");
    res.clearCookie(AuthToken.RF);
    res.status(StatusCodes.OK).json({message: ResponseMessage.SUCCESS});
};

/**
 * Make new access token. Also checking if DB is containing this refresh token or not
 * If not, then clear all the refresh token in the DB and user must login again for new valid refresh token
 *
 * @param {Request} req
 * @param {Response} res
 */
const refreshStudentToken = async (req: Request, res: Response) => {
    const rtFromCookie = req.cookies.refreshToken as string;

    if (!rtFromCookie) {
        throw new MissingTokenError(ResponseMessage.TOKEN_MISSING);
    }

    const {refreshToken, accessToken} =
        await userService.refreshStudentToken(rtFromCookie);
    //set two token to cookie
    res.cookie(AuthToken.RF, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: ms(jwtService.REFRESH_TOKEN_LIFE_SPAN),
    });
    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            accessToken: accessToken,
        },
    });
};

/**
 * If updated studentCode had already been existed in DB, return conflict status
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateStudentInfo = async (req: Request, res: Response) => {
    const studentId = req.params.id as string;
    const reqBody = req.body as StudentUpdate;

    await userService.updateStudent(studentId, reqBody);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const getStudent = async (req: Request, res: Response) => {
    const studentId = req.params.id as string;

    const student: StudentDTO | null =
        await userService.getStudentDTO(studentId);

    if (!student) {
        throw new UserNotFoundError(ResponseMessage.USER_NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: student,
    });
};

const getStudents = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const deletedInclude = Boolean(req.query.deletedInclude);
    const currentPage = req.query.currentPage
        ? Number(req.query.currentPage)
        : undefined;

    const students = await userService.getStudentDTOs(
        limit,
        deletedInclude,
        currentPage
    );

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: students,
    });
};

const deleteStudent = async (req: Request, res: Response) => {
    const studentId = req.params.id as string;

    await userService.deleteStudent(studentId);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

export default {
    //admins
    signupAsAdmin,
    loginAsAdmin,
    refreshAdminToken,
    logoutAsAdmin,
    deleteAdmin,
    getAdmin,
    updateAdminInfo,
    signupAsStudent,
    //students
    getStudents,
    loginAsStudent,
    refreshStudentToken,
    logoutAsStudent,
    deleteStudent,
    getStudent,
    updateStudentInfo,
};
