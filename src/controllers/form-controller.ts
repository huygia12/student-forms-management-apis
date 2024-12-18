import {Request, Response} from "express";
import formService from "@/services/form-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";
import {FormsRetrievement, FormStatusUpdate} from "@/common/schemas";
import {FormStatus} from "@prisma/client";
import jwtService from "@/services/jwt-service";
import {UserInToken} from "@/common/types";
import userService from "@/services/user-service";
import UserNotFoundError from "@/errors/user/user-not-found";
import FormNotFoundError from "@/errors/form/form-not-found";

const transformToEntries = (data: Record<string, string>) => {
    return Object.entries(data).map(([key, value]) => ({
        name: key,
        value: value,
    }));
};

const createForm = async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string;
    const categoryId = req.query.categoryId as string;
    const reqBody = req.body;

    const entries = transformToEntries(reqBody);

    const formId = await formService.insertForm(entries, studentId, categoryId);

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: {
            formId: formId,
        },
    });
};

const updateForm = async (req: Request, res: Response) => {
    const formId = req.params.id as string;
    const reqBody = req.body;

    const entries = transformToEntries(reqBody);

    await formService.updateForm(formId, entries);

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const deleteForm = async (req: Request, res: Response) => {
    const formId = req.params.id as string;

    await formService.deleteForm(formId);

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const uploadForm = async (req: Request, res: Response) => {
    const adminId = req.query.adminId as string;
    const categoryId = req.body.categoryId as string;
    const status = req.body.status as FormStatus;
    const fields = req.body.fields;
    const studentCode = req.body.fields.STUDENT_ID as string;

    const student = await userService.getStudentDTOByStudentCode(studentCode);
    if (!student)
        throw new UserNotFoundError(
            "Student with code " + studentCode + " cannot be found"
        );

    const entries = transformToEntries(fields);

    const formId = await formService.insertForm(
        entries,
        student.studentId,
        categoryId,
        status,
        adminId
    );

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: {
            formId: formId,
        },
    });
};

const getForm = async (req: Request, res: Response) => {
    const formId = req.params.id as string;

    const form = await formService.getFormFullJoin(formId);

    if (!form)
        throw new FormNotFoundError(
            "Form with id " + formId + " cannot be found"
        );

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: form,
    });
};

const getForms = async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId as string;
    const studentId = req.query.studentId as string;
    const reqBody = req.body as FormsRetrievement;

    const forms = await formService.getFormFullJoins({
        ...reqBody,
        limit: reqBody.limit || 10,
        currentPage: reqBody.currentPage || 1,
        studentId: studentId,
        categoryId: categoryId,
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: forms,
    });
};

const updateFormStatus = async (req: Request, res: Response) => {
    const accessToken: string | string[] | undefined =
        req.headers["authorization"];
    const {userId} = jwtService.decodeToken(
        accessToken!.replace("Bearer ", "")
    ) as UserInToken;

    const formId = req.params.id as string;
    const reqBody = req.body as FormStatusUpdate;

    const form = await formService.updateFormStatus(
        formId,
        userId,
        reqBody.status
    );

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: form,
    });
};

export default {
    createForm,
    getForms,
    getForm,
    updateFormStatus,
    uploadForm,
    updateForm,
    deleteForm,
};
