import {FormStatus} from "@prisma/client";
import {RequestMethod, ResponseMessage} from "./constants";
import {ZodSchema, ZodString, z} from "zod";

const blankCheck = (schema: ZodString = z.string()) =>
    schema.trim().refine((value) => value !== "", {
        message: ResponseMessage.BLANK_INPUT,
    });

const isValidDate = (value: string): boolean => {
    if (value === "") return true; // equivalent to undefined due to mobile app cannot send undefined date
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

const adminLoginSchema = z
    .object({
        email: blankCheck(),
        password: blankCheck(),
    })
    .strict();

const adminSignupSchema = z
    .object({
        email: blankCheck(),
        username: blankCheck(),
        password: z.string().min(6),
    })
    .strict();

const adminUpdateSchema = z
    .object({
        email: blankCheck().optional(),
        username: blankCheck().optional(),
        password: blankCheck(z.string().min(6)).optional(),
        retypePassword: blankCheck(z.string().min(6)).optional(),
        lastPassword: blankCheck(z.string().min(6)).optional(),
    })
    .strict();

const studentLoginSchema = z
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

const studentUpdateSchema = z
    .object({
        studentCode: blankCheck().optional(),
        username: blankCheck().optional(),
        password: blankCheck(z.string().min(6)).optional(),
        retypePassword: blankCheck(z.string().min(6)).optional(),
        lastPassword: blankCheck(z.string().min(6)).optional(),
    })
    .strict();

const formRetrivementSchema = z
    .object({
        keySearch: z.string().optional(),
        categoryIds: z.array(blankCheck()).optional(),
        status: z
            .array(
                z.enum([
                    FormStatus.APPROVED,
                    FormStatus.DENIED,
                    FormStatus.STAGING,
                ])
            )
            .optional(),
        limit: z.number().optional(),
        currentPage: z.number().optional(),
        fromDate: z
            .string()
            .refine((value) => isValidDate(value), "not a valid date")
            .optional(),
        toDate: z
            .string()
            .refine((value) => isValidDate(value), "not a valid date")
            .optional(),
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

const countFormGroupByCategorySchema = z.object({
    fromDate: z
        .string()
        .refine((value) => isValidDate(value), "invalid date")
        .optional(),
    toDate: z
        .string()
        .refine((value) => isValidDate(value), "invalid date")
        .optional(),
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
    ["/forms/createForm"]: {
        [RequestMethod.POST]: formInsertionSchema,
    },
    ["/forms/uploadForm"]: {
        [RequestMethod.POST]: formUploadSchema,
    },
    ["/forms/:id"]: {
        [RequestMethod.PATCH]: formStatusUpdateSchema,
    },
    ["/forms/statistic/group-by-category"]: {
        [RequestMethod.POST]: countFormGroupByCategorySchema,
    },
} as {[key: string]: {[method: string]: ZodSchema}};
