import json
import re
from PIL import Image

'''
This function returns the average brightness of the region
    the function is used for checkboxes only
'''
def get_average_brightness(imagePath, region):
    # open the image
    image = Image.open(imagePath)
    # crop the image
    cropped_image = image.crop((region[0], region[1], region[0] + region[2], region[1] + region[3]))
    # convert the image to grayscale
    grayscale_image = cropped_image.convert('L')
    # get the histogram of the image
    histogram = grayscale_image.histogram()
    # calculate the average brightness
    total_brightness = 0
    total_pixels = 0
    for i in range(256):
        total_brightness += i * histogram[i]
        total_pixels += histogram[i]
    average_brightness = total_brightness / total_pixels
    return average_brightness

'''
Get src files from 'base-forms/' folder, file is named:  page_number + '.jpg' file
'''
def create_json_schema(file, application_name):
    json_file = 'schemas/' + application_name + '-schema.json'
    # open the file
    pattern = r'(\d+) x (\d+) @ \((\d+), (\d+)\)'
    data = []
    with open(file, 'r') as txtfile:
        lines = txtfile.readlines() #start readingg line by line
        for line in lines:
            if line[0].isalpha(): # if the line starts with a letter, it means a new field
                fragments = line.strip().split(',')
                field_name = fragments[0]
                field_type = fragments[1]
                page_number = fragments[2]
                data_type = fragments[3]
                correction = fragments[4].split(':')
                correction_type = correction[0]
                correction_details = correction[1]
                regions = []
                index = 0
            elif line == '\n': # if the line is empty (seperate between two field or end of file)
                data.append({
                    "name": field_name,
                    "type": field_type,
                    "page_number": page_number,
                    "data_type": data_type,
                    "correction": {
                        "type": correction_type,
                        "details": correction_details
                    },
                    "regions": regions
                })
            else :
                # process the region-line
                line = line.strip().split(':')
                match = re.search(pattern, line[0])
                
                if match:
                    width = int(match.group(1))
                    height = int(match.group(2))
                    left = int(match.group(3))
                    top = int(match.group(4))
                    if field_type == 'CHECKBOX' :
                        entry = line[1] # the entry name is after the ':' symbol
                        input_path = 'base-forms/' + application_name + '/' + page_number + '.jpg'
                        brightness = get_average_brightness(input_path, [left, top, width, height])
                        regions.append({"index" : index, "region" : [left, top, width, height], "entry" : entry, "brightness" : brightness})
                    else :
                        regions.append({"index" : index, "region" : [left, top, width, height]})
                    index += 1
                else :
                    print('[field_creator]: Invalid region line format', line)

        with open(json_file, 'w') as jsonfile:
            json.dump(data, jsonfile, indent=2)

'''
region.txt file note: notice that field-line and region-line must not start with space 
- Field-line must start with an alphabetic character, must be in 
    'field_name,field_type,page_number,data_type,correction_type:correction_details' format
- Region-line must be in 'num x num @ (num, num):entry' format 
    (note that entry is optional, but must be sepecify if field_type is CHECKBOX)
- End of the file with these two lines below (blank line before the dummy line): 

    DUMMY,DUMMY,-1,DUMMY,DUMMY:
'''
if __name__ == "__main__":
    application_name = 'drop-out-school-application'
    source_file = 'region.txt'
    create_json_schema(source_file, application_name)
