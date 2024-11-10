import type {UserRole} from "@prisma/client";

export interface UserDTO {
    userId: string;
    username: string;
    role: UserRole;
    fingerprint: string | null;
    createdAt: Date;
}

export interface UserInToken {
    userId: string;
    username: string;
    role: UserRole;
}
