import {Gender} from "@prisma/client";
import {RequestMethod, ResponseMessage} from "./constants";
import zod, {ZodSchema, z} from "zod";

const blankCheck = () =>
    zod
        .string()
        .trim()
        .refine((value) => value !== "", {
            message: ResponseMessage.BLANK_INPUT,
        });

const isValidDate = (value: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Matches dd/MM/yyyy format
    if (!regex.test(value)) {
        return false;
    }

    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    // Check if the date parts are valid
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

const adminLoginSchema = zod
    .object({
        email: blankCheck(),
        password: blankCheck(),
    })
    .strict();

const adminSignupSchema = zod
    .object({
        email: blankCheck(),
        username: blankCheck(),
        avatar: blankCheck().optional(),
        password: z.string().min(6),
    })
    .strict();

const adminUpdateSchema = zod
    .object({
        email: blankCheck().optional(),
        username: blankCheck().optional(),
        avatar: blankCheck().optional(),
    })
    .strict();

const studentLoginSchema = zod
    .object({
        studentCode: blankCheck(),
        password: blankCheck(),
    })
    .strict();

const studentSignupSchema = zod.array(
    z
        .object({
            studentCode: blankCheck(),
            password: z.string().min(6),
            avatar: blankCheck().optional(),
            username: blankCheck(),
            major: blankCheck(),
            phoneNumber: blankCheck().optional(),
            gender: z.enum([Gender.FEMALE, Gender.MALE]),
            birthdate: z.string().refine((value) => isValidDate(value), {
                message: "Invalid date format or value. Expected dd/MM/yyyy.",
            }),
        })
        .strict()
);

const studentUpdateSchema = zod
    .object({
        studentCode: blankCheck().optional(),
        avatar: blankCheck().optional(),
        username: blankCheck().optional(),
        major: blankCheck().optional(),
        phoneNumber: blankCheck().optional(),
        gender: z.enum([Gender.FEMALE, Gender.MALE]).optional(),
        birthdate: z
            .string()
            .refine((value) => isValidDate(value), {
                message: "Invalid date format or value. Expected dd/MM/yyyy.",
            })
            .optional(),
    })
    .strict();

export type AdminSignup = z.infer<typeof adminSignupSchema>;

export type AdminLogin = z.infer<typeof adminLoginSchema>;

export type AdminUpdate = z.infer<typeof adminUpdateSchema>;

export type StudentLogin = z.infer<typeof studentLoginSchema>;

export type StudentSignup = z.infer<typeof studentSignupSchema>;

export type StudentUpdate = z.infer<typeof studentUpdateSchema>;

export default {
    ["/admins/signup"]: {
        [RequestMethod.POST]: adminSignupSchema,
    },
    ["/admins/login"]: {
        [RequestMethod.POST]: adminLoginSchema,
    },
    ["/admins/:id"]: {
        [RequestMethod.PUT]: adminUpdateSchema,
    },
    ["/students/signup"]: {
        [RequestMethod.POST]: studentSignupSchema,
    },
    ["/students/login"]: {
        [RequestMethod.POST]: studentLoginSchema,
    },
    ["/students/:id"]: {
        [RequestMethod.PUT]: studentUpdateSchema,
    },
} as {[key: string]: {[method: string]: ZodSchema}};
