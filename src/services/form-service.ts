import {Entry, FormFullJoin} from "@/common/types";
import prisma from "@/common/prisma-client";
import {FormStatus, PersonalForm} from "@prisma/client";
import FormNotFoundError from "@/errors/form/form-not-found";
import FormActionDenied from "@/errors/form/form-action-denied";

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
        orderBy: {
            createdAt: "desc",
        },
        take: params.limit == 0 ? undefined : params.limit,
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

const getForm = async (formId: string): Promise<PersonalForm | null> => {
    const form = await prisma.personalForm.findFirst({
        where: {
            personalFormId: formId,
        },
    });

    return form;
};

const updateForm = async (formId: string, fields: Entry[]): Promise<void> => {
    const form = await getForm(formId);
    if (!form) {
        throw new FormNotFoundError(
            "Form with id " + formId + " cannot be found"
        );
    }

    if (form.status !== FormStatus.STAGING) {
        throw new FormActionDenied("unable to update this form");
    }

    await prisma.$transaction(async (prisma) => {
        await prisma.field.deleteMany({
            where: {
                personalFormId: formId,
            },
        });

        await prisma.field.createMany({
            data: fields.map((entry) => ({
                personalFormId: formId,
                name: entry.name,
                value: entry.value,
            })),
        });
    });
};

const deleteForm = async (formId: string) => {
    const form = await getForm(formId);
    if (!form) {
        throw new FormNotFoundError(
            "Form with id " + formId + " cannot be found"
        );
    }

    if (form.status === FormStatus.APPROVED) {
        throw new FormActionDenied("unable to delete this form");
    }

    await prisma.$transaction(async (prisma) => {
        await prisma.field.deleteMany({
            where: {
                personalFormId: formId,
            },
        });

        await prisma.personalForm.delete({
            where: {
                personalFormId: formId,
            },
        });
    });
};

export default {
    insertForm,
    updateForm,
    getFormFullJoins,
    getFormFullJoin,
    updateFormStatus,
    deleteForm,
};
