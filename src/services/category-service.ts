import {Category} from "@prisma/client";
import prisma from "@/common/prisma-client";

const getCategories = async (): Promise<Category[]> => {
    const categories = await prisma.category.findMany({
        select: {
            categoryId: true,
            title: true,
        },
    });
    return categories;
};

export default {getCategories};
