import {Entry, FormFullJoin} from "@/common/types";
import prisma from "@/common/prisma-client";
import {FormStatus, PersonalForm} from "@prisma/client";

const insertForm = async (
    fields: Entry[],
    studentId: string,
    categoryId: string,
    status: FormStatus = FormStatus.STAGING,
    adminId?: string
): Promise<string | undefined> => {
    let formId;
    await prisma.$transaction(async (prisma) => {
        const form = await prisma.personalForm.create({
            data: {
                studentId: studentId,
                categoryId: categoryId,
                status: status,
                updatedBy: adminId,
            },
            select: {
                personalFormId: true,
            },
        });

        formId = form.personalFormId;

        await prisma.field.createMany({
            data: fields.map((entry) => ({
                personalFormId: form.personalFormId,
                name: entry.name,
                value: entry.value,
            })),
        });
    });

    return formId;
};

const getFormFullJoin = async (
    formId: string
): Promise<FormFullJoin | null> => {
    const form = await prisma.personalForm.findFirst({
        where: {
            personalFormId: formId,
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
    });
    return form;
};

const getFormFullJoins = async (params: {
    categoryId?: string;
    studentId?: string;
    keySearch?: string;
    limit: number;
    currentPage: number;
}): Promise<FormFullJoin[]> => {
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

export default {
    insertForm,
    getFormFullJoins,
    getFormFullJoin,
    updateFormStatus,
};
