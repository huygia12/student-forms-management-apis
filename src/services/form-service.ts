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

const getFormFullJoins = async (params: {
    categoryId?: string;
    studentId?: string;
    limit: number;
    currentPage: number;
}): Promise<FormFullJoin[]> => {
    const forms = await prisma.personalForm.findMany({
        where: {
            studentId: params.studentId,
            categoryId: params.categoryId,
        },
        include: {
            fields: true,
            student: {
                select: {
                    studentId: true,
                    studentCode: true,
                    username: true,
                },
            },
            category: true,
        },
        skip: (params.currentPage - 1) * params.limit,
    });
    return forms;
};

export default {insertForm, getFormFullJoins};
