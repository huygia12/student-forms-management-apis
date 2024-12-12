import {Gender} from "@prisma/client";

export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
}

export interface StudentDTO {
    studentId: string;
    studentCode: string;
    avatar: string | null;
    username: string;
    major: string;
    phoneNumber: string | null;
    gender: Gender;
    birthdate: Date;
    createdAt: Date;
    deletedAt: Date | null;
}

export interface AdminDTO {
    adminId: string;
    avatar: string | null;
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
