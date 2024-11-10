import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
    const result = await next(params);
    if (params.model === "User" && result) {
        if (Array.isArray(result)) {
            result.forEach((user) => {
                user.isActive = user.fingerprint ? true : false;
                user.fingerprint = "";
            });
        } else {
            result.isActive = result.fingerprint ? true : false;
            result.fingerprint = "";
        }
    }

    return result;
});

export default prisma;
