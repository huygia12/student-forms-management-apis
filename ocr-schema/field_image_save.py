import os
import json
from PIL import Image

def initialize_out_folder(output_path):
    word_path = output_path + 'OCR_WORD/'
    char_path = output_path + 'OCR_CHAR/'
    checkbox_path = output_path + 'CHECKBOX/'

    if not os.path.exists(output_path): # If not exist, create
        os.makedirs(output_path)
        print(f"Folder created at {output_path}")

    #WORD
    if not os.path.exists(word_path):
        os.makedirs(word_path)
        print(f"Folder created at {word_path}")

    #CHAR
    if not os.path.exists(char_path):
        os.makedirs(char_path)
        print(f"Folder created at {char_path}")

    #CHECKBOX
    if not os.path.exists(checkbox_path):
        os.makedirs(checkbox_path)
        print(f"Folder created at {checkbox_path}")

def save_fields_as_images(base_source_path, base_output_path, schema_file):
    # open the schema file and read it
    with open(schema_file, 'r') as f:
        schema = json.load(f)
        for field in schema:
            field_name = field['name']
            field_type = field['type']
            page_number = field['page_number']
            field_regions = field['regions']

            image_path = base_source_path + str(page_number) + '.jpg'
            image = Image.open(image_path)

            for regionInfo in field_regions:
                output_path = base_output_path + field_type + '/' + field_name + '_' + str(regionInfo['index']) + '.jpg'
                region = regionInfo['region']
                cropped_image = image.crop((region[0], region[1], region[0] + region[2], region[1] + region[3]))
                cropped_image.save(output_path)

'''
For debugging purposes only
Crop all regions that is specified in the -schema.json
'''
if __name__ == '__main__':
    application_name='drop-out-school-application'
    output_path = 'debug/'

    initialize_out_folder(output_path)
    
    #clean the output folder
    for folder in os.listdir(output_path):
        folder_path = os.path.join(output_path, folder)
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            os.remove(file_path)

    image_path = 'base-forms/' + application_name + '/'
    schema_file = 'schemas/' + application_name + '-schema.json'
    save_fields_as_images(image_path, output_path, schema_file)