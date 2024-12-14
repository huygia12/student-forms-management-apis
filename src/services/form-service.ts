import {Entry, FormFullJoin} from "@/common/types";
import prisma from "@/common/prisma-client";

const insertForm = async (
    fields: Entry[],
    studentId: string,
    categoryId: string
) => {
    await prisma.$transaction(async (prisma) => {
        const form = await prisma.personalForm.create({
            data: {
                studentId: studentId,
                categoryId: categoryId,
            },
            select: {
                personalFormId: true,
            },
        });

        await prisma.field.createMany({
            data: fields.map((entry) => ({
                personalFormId: form.personalFormId,
                name: entry.name,
                value: entry.value,
            })),
        });
    });
    return true;
};

const getFormFullJoins = async (
    limit: number = 10,
    params: {
        categoryId?: string;
        studentId?: string;
    }
): Promise<FormFullJoin[]> => {
    const forms = await prisma.personalForm.findMany({
        where: {
            studentId: params.studentId,
            categoryId: params.categoryId,
        },
        include: {
            fields: true,
            student: true,
            category: true,
        },
        skip: limit,
    });

    return forms;
};

export default {insertForm, getFormFullJoins};
