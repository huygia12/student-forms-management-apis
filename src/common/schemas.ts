import {RequestMethod, ResponseMessage} from "./constants";
import zod, {ZodSchema, z} from "zod";

const blankCheck = () =>
    zod
        .string()
        .trim()
        .refine((value) => value !== "", {
            message: ResponseMessage.BLANK_INPUT,
        });

const signupSchema = zod
    .object({
        username: blankCheck(),
        password: blankCheck().optional(),
    })
    .strict();

const loginSchema = zod
    .object({
        username: blankCheck(),
        password: blankCheck(),
    })
    .strict();

const userUpdateSchema = zod
    .object({
        username: blankCheck().optional(),
        fingerprint: blankCheck().optional(),
    })
    .strict()
    .refine(
        (value) => value.fingerprint || value.username,
        ResponseMessage.PAYLOAD_IS_REQUIRED
    );

export type UserSignup = z.infer<typeof signupSchema>;

export type UserLogin = z.infer<typeof loginSchema>;

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export default {
    ["/users/signup"]: {
        [RequestMethod.POST]: signupSchema,
    },
    ["/users/login"]: {
        [RequestMethod.POST]: loginSchema,
    },
    ["/users/:id"]: {
        [RequestMethod.PUT]: userUpdateSchema,
    },
    ["users"]: {
        ["update"]: userUpdateSchema,
    },
} as {[key: string]: {[method: string]: ZodSchema}};
