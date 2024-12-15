import {Entry, FormFullJoin} from "@/common/types";
import prisma from "@/common/prisma-client";
import {FormStatus, PersonalForm} from "@prisma/client";

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
    keySearch?: string;
    limit: number;
    currentPage: number;
}): Promise<FormFullJoin[]> => {
    console.log(params);
    const forms = await prisma.personalForm.findMany({
        where: {
            studentId: params.studentId,
            categoryId: params.categoryId,
            student: {
                username: {
                    contains: params.keySearch,
                    mode: "insensitive",
                },
            },
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
        take: params.limit,
        skip: (params.currentPage - 1) * params.limit,
    });
    return forms;
};

const updateFormStatus = async (
    formId: string,
    adminId: string,
    status: FormStatus
): Promise<PersonalForm> => {
    const form = await prisma.personalForm.update({
        where: {
            personalFormId: formId,
        },
        data: {
            status: status,
            updatedBy: adminId,
        },
    });

    return form;
};

export default {insertForm, getFormFullJoins, updateFormStatus};
