import {Request, Response} from "express";
import formService from "@/services/form-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";
import {FormsRetrievement, FormStatusUpdate} from "@/common/schemas";
import {FormStatus} from "@prisma/client";
import jwtService from "@/services/jwt-service";
import {UserInToken} from "@/common/types";

const createForm = async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string;
    const categoryId = req.query.categoryId as string;
    const reqBody = req.body;

    const entries = Object.entries(reqBody).map(([key, value]) => ({
        name: key as string,
        value: value as string,
    }));

    await formService.insertForm(entries, studentId, categoryId);

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
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
        studentId: studentId.length > 0 ? studentId : undefined,
        categoryId: categoryId.length > 0 ? categoryId : undefined,
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

export default {createForm, getForms, udpateFormStatus: updateFormStatus};
