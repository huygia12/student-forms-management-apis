import {Request, Response} from "express";
import formService from "@/services/form-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";
import {FormsRetrievement, FormStatusUpdate} from "@/common/schemas";
import {FormStatus} from "@prisma/client";
import jwtService from "@/services/jwt-service";
import {UserInToken, UserRole} from "@/common/types";
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
    const studentId = req.query.studentId as string;
    const reqBody = req.body as FormsRetrievement;
    const fromDate = req.body.fromDate && parseDate(req.body.fromDate);
    const toDate = req.body.toDate && parseDate(req.body.toDate);
    let categoryIds = req.body.categoryIds as string[] | undefined;
    let status = reqBody.status as FormStatus[] | undefined;

    categoryIds && categoryIds.length === 0 ? undefined : categoryIds;
    status && status.length === 0 ? undefined : status;

    const forms = await formService.getFormFullJoins({
        keySearch: req.body.keySearch,
        categoryIds: categoryIds,
        status: status,
        fromDate: fromDate,
        toDate: toDate,
        limit: reqBody.limit ?? 20,
        currentPage: reqBody.currentPage ?? 1,
        studentId: studentId,
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

const getEachCategoryNumberOfForms = async (req: Request, res: Response) => {
    const fromDate = req.body.fromDate && parseDate(req.body.fromDate);
    const toDate = req.body.toDate && parseDate(req.body.toDate);

    const data = await formService.getFormNumberOfEachCategories({
        fromDate: fromDate,
        toDate: toDate,
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: data,
    });
};

const getNumberOfForms = async (req: Request, res: Response) => {
    const accessToken: string | string[] | undefined =
        req.headers["authorization"];
    const {role, userId} = jwtService.decodeToken(
        accessToken!.replace("Bearer ", "")
    ) as UserInToken;

    const data = await formService.getNumberOfForms({
        userId: UserRole.ADMIN === role ? undefined : userId,
    });

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: {
            totalForms: data,
        },
    });
};

const parseDate = (dateString: string): Date | undefined => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
        return undefined;
    }

    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export default {
    createForm,
    getForms,
    getForm,
    updateFormStatus,
    uploadForm,
    updateForm,
    deleteForm,
    getEachCategoryNumberOfForms,
    getNumberOfForms,
};
