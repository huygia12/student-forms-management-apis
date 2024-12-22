import {Request, Response} from "express";
import categoryService from "@/services/category-service";
import mailService from "@/services/mail-service";
import {StatusCodes} from "http-status-codes";
import {ResponseMessage} from "@/common/constants";

const pushMail = async (req: Request, res: Response) => {
    const email = req.query.email as string;
    const subject = "Welcome to Our Platform!";

    try {
        await mailService.sendEmail(
            email,
            subject,
            mailService.getSignUpGmailNotify()
        );
        res.status(201).json({message: "User registered successfully!"});
    } catch (error) {
        res.status(500).json({message: "Failed to send email", error});
    }
};

const getCategories = async (req: Request, res: Response) => {
    const categories = await categoryService.getCategories();

    return res.status(StatusCodes.CREATED).json({
        message: ResponseMessage.SUCCESS,
        info: categories,
    });
};

export default {getCategories, pushMail};
