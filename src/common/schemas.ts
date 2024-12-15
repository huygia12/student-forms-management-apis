import {FormStatus} from "@prisma/client";
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

const transformToEntries = (data: Record<string, string>) => {
    return Object.entries(data).map(([key, value]) => ({name: key, value}));
};

const EntrySchema = z.object({
    name: z.string(),
    value: z.string(),
});

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

const studentSignupSchema = z
    .object({
        studentCode: blankCheck(),
        password: z.string().min(6),
        username: blankCheck(),
    })
    .strict();

const studentUpdateSchema = zod
    .object({
        studentCode: blankCheck().optional(),
        username: blankCheck().optional(),
        phoneNumber: blankCheck().optional(),
    })
    .strict();

const formRetrivementSchema = z
    .object({
        keySearch: z.string().optional(),
        status: z
            .enum([FormStatus.APPROVED, FormStatus.DENIED, FormStatus.STAGING])
            .optional(),
        limit: z.number().optional(),
        currentPage: z.number().optional(),
    })
    .strict();

const formStatusUpdateSchema = z
    .object({
        status: z.enum([
            FormStatus.APPROVED,
            FormStatus.DENIED,
            FormStatus.STAGING,
        ]),
    })
    .strict();

const formInsertionSchema = z.preprocess(
    (data) => transformToEntries(data as Record<string, string>),
    z.array(EntrySchema)
);

const formUploadSchema = z.object({
    categoryId: z.string(),
    status: z.enum([
        FormStatus.APPROVED,
        FormStatus.DENIED,
        FormStatus.STAGING,
    ]),
    fields: z.preprocess(
        (data) => transformToEntries(data as Record<string, string>),
        z.array(EntrySchema)
    ),
});

export type AdminSignup = z.infer<typeof adminSignupSchema>;

export type AdminLogin = z.infer<typeof adminLoginSchema>;

export type AdminUpdate = z.infer<typeof adminUpdateSchema>;

export type StudentLogin = z.infer<typeof studentLoginSchema>;

export type StudentSignup = z.infer<typeof studentSignupSchema>;

export type StudentUpdate = z.infer<typeof studentUpdateSchema>;

export type FormsRetrievement = z.infer<typeof formRetrivementSchema>;

export type FormStatusUpdate = z.infer<typeof formStatusUpdateSchema>;

export type FormUpload = z.infer<typeof formUploadSchema>;

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
    ["/forms"]: {
        [RequestMethod.POST]: formRetrivementSchema,
    },
    ["/createForm"]: {
        [RequestMethod.POST]: formInsertionSchema,
    },
    ["/uploadForm"]: {
        [RequestMethod.POST]: formUploadSchema,
    },
    ["/forms/:id"]: {
        [RequestMethod.PATCH]: formStatusUpdateSchema,
    },
} as {[key: string]: {[method: string]: ZodSchema}};
