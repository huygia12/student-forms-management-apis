import {Request, Response} from "express";
import categoryService from "@/services/category-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";

const getCategories = async (req: Request, res: Response) => {
    const categories = await categoryService.getCategories();

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: categories,
    });
};

export default {getCategories};
