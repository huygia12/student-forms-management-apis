import {Category, Field, PersonalForm} from "@prisma/client";

export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
}

export interface StudentDTO {
    studentId: string;
    studentCode: string;
    username: string;
    createdAt: Date;
    deletedAt: Date | null;
}

export interface AdminDTO {
    adminId: string;
    username: string;
    email: string;
    createdAt: Date;
    deletedAt: Date | null;
}

export interface UserInToken {
    userId: string;
    username: string;
    role: UserRole;
}

export interface Entry {
    name: string;
    value: string;
}

export type FormFullJoin = PersonalForm & {
    fields: Field[];
    category: Category;
    student: {
        studentId: string;
        studentCode: string;
        username: string;
    };
};
