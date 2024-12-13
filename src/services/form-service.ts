import {Entry} from "@/common/types";
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
    console.log("Form inserted successfully");
    return true;
};

export default {insertForm};
