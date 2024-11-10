import {ResponseMessage} from "@/common/constants";
import ocrService from "@/services/ocr-service";
import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

/**
 * ALl files must have the same extension, value can be one of these: jpg|jpeg|png|webp
 * @param req
 * @param res
 */
const extractText = async (req: Request, res: Response) => {
    const processingImageUrl = req.body.image_urls as string[];
    const userId = (req.body.user_id as string) || "111";
    const formId = (req.body.form_id as string) || "123";

    const applicationName = "drop-out-school-application-schema"; // TODO: get this from db
    const info = await ocrService.extractText(
        applicationName,
        formId,
        processingImageUrl,
        userId
    );

    console.debug(`[demo controller]: extract text succeed`);
    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: info,
    });
};

export default {extractText};
