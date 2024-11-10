import {ImageExtension, OCRDataType} from "@/common/constants";
import DowloadFileError from "@/errors/ocr/dowload-file-error";
import axios, {AxiosError} from "axios";
import fs from "fs";
import {Jimp} from "jimp";
import path from "path";
import {createScheduler, createWorker} from "tesseract.js";

//fs use path from root, not relative path
const OCR_SCHEMA_PATH = "ocr-schema/schemas/";
const DOWLOADED_FILES_PATH = "form-images/";
const OCR_OUTPUT_PATH = "ocr-schema/ocr-output/";

const initializeDirectories = () => {
    if (!fs.existsSync(OCR_OUTPUT_PATH)) {
        fs.mkdirSync(OCR_OUTPUT_PATH, {recursive: true});
    }
    if (!fs.existsSync(DOWLOADED_FILES_PATH)) {
        fs.mkdirSync(DOWLOADED_FILES_PATH, {recursive: true});
    }
};

const getExtensionFromUrl = (url: string): ImageExtension | null => {
    const imagePath = url.split("?");
    const matches = imagePath[0].match(/\.(jpg|jpeg|png|webp?)$/i);
    return matches ? (matches[0].slice(1) as ImageExtension) : null;
};

/**
 * @param dowloadingUrls
 * @param outputFolder store the dowloaded files
 * @param nameToSave start name for all the files, following by the number of it position in array
 * @param extension all urls must have the same image extension, can be jpg|jpeg|png|webp
 */
const downloadFiles = async (
    dowloadingUrls: string[],
    outputFolder: string,
    nameToSave: string,
    extension: ImageExtension
) => {
    try {
        let counter = 1;
        for (const url of dowloadingUrls) {
            const response = await axios.get(url, {
                responseType: "stream",
            });

            const fullPath = path.join(
                outputFolder,
                `${nameToSave}-${counter++}.${extension}`
            );
            if (!fs.existsSync(outputFolder)) {
                fs.mkdirSync(outputFolder, {recursive: true});
            }
            response.data.pipe(fs.createWriteStream(fullPath));

            // Wait for the file to finish downloading
            await new Promise<void>((resolve, reject) => {
                response.data.on("end", () => resolve());
                response.data.on("error", (err: Error) => reject(err));
            });
        }
    } catch (error) {
        if (error instanceof AxiosError)
            throw new DowloadFileError(`Dowload file error: ${error.message}`);
        else throw new Error(`Dowload file error`);
    }
};

const calculate_average_brightness = async (
    imagePath: string,
    boxPosition: {
        x: number;
        y: number;
        w: number;
        h: number;
    }
): Promise<number | null> => {
    try {
        const image = await Jimp.read(imagePath);
        const region = image.clone().crop(boxPosition);

        let totalBrightness = 0;

        region.scan(
            0,
            0,
            region.bitmap.width,
            region.bitmap.height,
            (x, y, idx) => {
                const red = region.bitmap.data[idx];
                const green = region.bitmap.data[idx + 1];
                const blue = region.bitmap.data[idx + 2];
                const brightness = (red + green + blue) / 3;
                totalBrightness += brightness;
            }
        );

        const averageBrightness =
            totalBrightness / (region.bitmap.width * region.bitmap.height);
        return averageBrightness;
    } catch (error) {
        console.error("[ocr-service]: read file fail: ", error);
        return null;
    }
};

const performOcr = async (
    imagePath: string,
    region: number[]
): Promise<string> => {
    const worker = await createWorker("vie");
    const {
        data: {text},
    } = await worker.recognize(imagePath, {
        rectangle: {
            left: region[0],
            top: region[1],
            width: region[2],
            height: region[3],
        },
    });
    await worker.terminate();
    return text.trimEnd();
};

const scanLetterByLetter = async (
    imagePath: string,
    regions: {index: number; region: number[]}[]
): Promise<string> => {
    let text = "";
    for (let regionInfo of regions) {
        let char = await performOcr(imagePath, regionInfo.region);
        char = char.replace(/\n/g, ""); //Remove all newline characters
        text += char;
    }
    return text.trimEnd();
};

const getCheckboxInput = async (
    imagePath: string,
    regions: {
        index: number;
        region: number[];
        entry: string;
        brightness: number;
    }[]
) => {
    let entries = [];
    const brightness_threshold = 3;
    for (let regionInfo of regions) {
        let averageBrightness = await calculate_average_brightness(imagePath, {
            x: regionInfo.region[0],
            y: regionInfo.region[1],
            w: regionInfo.region[2],
            h: regionInfo.region[3],
        });
        if (!averageBrightness) throw new Error(`Read image file fail`);
        if (regionInfo.brightness - averageBrightness > brightness_threshold) {
            entries.push(regionInfo.entry);
        }
    }
    // console.log(entries)
    return entries;
};

const extractText = async (
    applicationName: string,
    formId: string,
    processingImageUrl: string[],
    userId: string
) => {
    const extension =
        getExtensionFromUrl(processingImageUrl[0]) || ImageExtension.JPG;
    if (!extension) throw new Error("Extension invalid");

    const schemaFile = `${OCR_SCHEMA_PATH}${applicationName}.json`;
    const ocrOutput = [];
    const scheduler = createScheduler();

    // Create directories if they don't exist
    initializeDirectories();

    // Dowloaded files will be in 'DOWLOAD_PATH/formId/userId-page_number.extension' format
    await downloadFiles(
        processingImageUrl,
        `${DOWLOADED_FILES_PATH}${formId}`,
        userId,
        extension
    );

    const data = fs.readFileSync(schemaFile, "utf8");
    const fields = JSON.parse(data);

    for (const field of fields) {
        const imagePath = `${DOWLOADED_FILES_PATH}${formId}/${userId}-${field.page_number}.${extension}`;

        if (field.type == OCRDataType.OCR_WORD) {
            let region = field.regions[0].region;
            let ocr_text = await performOcr(imagePath, region);
            ocrOutput.push({
                name: field.name,
                field_type: field.type,
                data_type: field.data_type,
                text: ocr_text,
                correction: field.correction,
            });
        } else if (field.type == OCRDataType.OCR_CHAR) {
            let ocr_text = await scanLetterByLetter(imagePath, field.regions);
            ocrOutput.push({
                name: field.name,
                field_type: field.type,
                data_type: field.data_type,
                text: ocr_text,
                correction: field.correction,
            });
        } else if (field.type == OCRDataType.CHECK_BOX) {
            let entries = await getCheckboxInput(imagePath, field.regions);
            ocrOutput.push({
                name: field.name,
                field_type: field.type,
                data_type: field.data_type,
                text: entries,
                correction: field.correction,
            });
        }
        scheduler.terminate();
    }

    const ocrResult = JSON.stringify(ocrOutput, null, 2);
    const ocrResultFileName = OCR_OUTPUT_PATH + "ocr_" + formId + ".json";
    fs.writeFileSync(ocrResultFileName, ocrResult);

    //call the correction module
    // console.debug("Calling correction module");
    // let form_output = await correction.correct(ocr_result_file_name);
    // console.debug(form_output)
    return ocrOutput;
};

export default {extractText};
