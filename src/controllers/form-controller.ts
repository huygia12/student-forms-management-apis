import {Request, Response} from "express";
import formService from "@/services/form-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";

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
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const forms = await formService.getFormFullJoins(limit, {
        studentId: studentId,
        categoryId: categoryId,
    });

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: forms,
    });
};

export default {createForm, getForms};
