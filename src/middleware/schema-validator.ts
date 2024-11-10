import {ResponseMessage} from "@/common/constants";
import schemas from "@/common/schemas";
import {ValidationError} from "@/errors/custom-error";
import {RequestHandler} from "express";
import {StatusCodes} from "http-status-codes";
import {ZodError, ZodIssueOptionalMessage} from "zod";

const expressSchemaValidator = (
    path: string,
    useZodError: boolean = true
): RequestHandler => {
    const schemaObject = schemas[path];
    if (!schemaObject) {
        throw new Error(`Method and schema not found for path: ${path}`);
    }

    return (req, res, next) => {
        console.debug(
            `[schema validator] request body : ${JSON.stringify(
                req.body,
                null,
                2
            )}`
        );

        const schema = schemaObject[req.method];
        if (!schema) {
            throw new Error(
                `Does not match any method-schema defined in schemas.ts: ${req.method}`
            );
        }

        try {
            schema.parse(req.body);
        } catch (error: unknown) {
            console.debug(
                `[schema validator] zod detect errors : ${JSON.stringify(
                    error,
                    null,
                    2
                )}`
            );

            if (error instanceof ZodError) {
                const zodError: ValidationError = {
                    status: "failed",
                    details: error.errors.map(
                        ({code, message, path}: ZodIssueOptionalMessage) => ({
                            code: code,
                            message: message,
                            path: path.toString(),
                        })
                    ),
                };
                return res.status(422).json(useZodError && zodError);
            }
            throw new Error(
                `Unexpected error during schema validation: ${error}`
            );
        }

        // validation successful
        console.debug(`[schema validator] succeed}`);
        return next();
    };
};

const socketIOSchemaValidator = (
    clientEvent: string,
    payload: unknown,
    callback: Function
): boolean => {
    const eventBroker: string[] = clientEvent.split(":");

    const schema = schemas[eventBroker[0]][eventBroker[1]];
    if (!schema) {
        throw new Error(`Schema not found for clientEvent: ${clientEvent}`);
    }

    try {
        schema.parse(payload);
    } catch (error: unknown) {
        console.debug(
            `[schema validator] zod detect errors : ${JSON.stringify(
                error,
                null,
                2
            )}`
        );

        if (error instanceof ZodError) {
            const zodError: ValidationError = {
                status: "failed",
                details: error.errors.map(
                    ({code, message, path}: ZodIssueOptionalMessage) => ({
                        code: code,
                        message: message,
                        path: path.toString(),
                    })
                ),
            };
            callback({
                status: StatusCodes.UNPROCESSABLE_ENTITY,
                detail: zodError,
            });
        } else {
            callback({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ResponseMessage.UNEXPECTED_ERROR,
            });
        }
        return false;
    }

    // validation succeed
    console.debug(`[schema validator] socket payload valid`);
    return true;
};

export {expressSchemaValidator, socketIOSchemaValidator};
