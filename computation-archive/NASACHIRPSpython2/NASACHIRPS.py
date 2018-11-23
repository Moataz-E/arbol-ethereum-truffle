
import requests
import datetime
import time
import json
from dateutil.relativedelta import relativedelta
import logging
import os


    #TODO use bigfloat for decimals
    #TODO make work for periods longer than a year
    #TODO write some tests
    #TODO better validation
    #TODO print something sensible if there's a timeout / API fail
    #TODO check for 0.00 values....
    #TODO fuzzing?


def main(WIT_ID, num_averaged_years, start_date, end_date, threshold_factor, top_left, bottom_left, bottom_right, top_right, log):
    '''
    NASA runs an API services called climateSERV, which accepts queries to the CHIRPS dataset.

    CHIRPS is a global gridded dataset that is made by interpolating weather station and 
    satellite data.

    Full climateSERV documentation: https://climateserv.readthedocs.io/en/latest/api.html

    In this function, we make a GET call to climateSERV to submit our query, which is based on the values
    of the arguments to this function. 

    top_left, bottom_left, bottom_right, and top_right are tuples that each represent a lat/lon coordinate
    pair. The four points describe a box which represents the area of interest.

    threshold_factor is the percentage of the historical average against which we are comparing new data.

    10000 = 100%, 9000 = 90%, 11000 = 110%, etc.

    '''


    box = [[top_left[1],     top_left[0]],
           [bottom_left[1],  bottom_left[0]],
           [bottom_right[1], bottom_right[0]],
           [top_right[1],    top_right[0]]]

    url = "https://climateserv.servirglobal.net/chirps/submitDataRequest/"
    querystring = {"callback":"successCallback"}
    payload = (
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"datatype\"\r\n"
        "\r\n"
        "0\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"begintime\"\r\n"
        "\r\n"
        "%s\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"endtime\"\r\n"
        "\r\n"
        "%s\r\n"
        "------&&&"
        "\r\nContent-Disposition: form-data; name=\"intervaltype\"\r\n"
        "\r\n"
        "0\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"operationtype\"\r\n"
        "\r\n"
        "5\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"callback\"\r\n"
        "\r\n"
        "successCallback\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"dateType_Category\"\r\n"
        "\r\n"
        "default"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"isZip_CurrentDataType\"\r\n"
        "\r\n"
        "false\r\n"
        "------&&&\r\n"
        "Content-Disposition: form-data; name=\"geometry\"\r\n"
        "\r\n"
        "{\"type\":\"Polygon\",\"coordinates\":[%s]}\r\n"
        "------&&&--" 
        %
        (
            (start_date - relativedelta(years=num_averaged_years)).strftime("%m/%d/%Y"), 
            end_date.strftime("%m/%d/%Y"), 
            str(box)
        )
    )

    headers = {
        'content-type': "multipart/form-data; boundary=----&&&",
        'Content-Type': "application/json",
        'cache-control': "no-cache"
    }

    log.info("\n\n\n\n")
    log.info("Querying API")
    log.info(str(payload))

    #response = requests.get(request_url)
    response = requests.request("POST", url, data=payload, headers=headers, params=querystring)

    if response.status_code != 200:
        print(response.text)
        print("%i&%s&%s&%s&%s&%s" % (response.status_code, 0, 0, 0, 0, 0))
        quit()

    job_id = response.text[18:-3]

    progress_url = 'https://climateserv.servirglobal.net/chirps/getDataRequestProgress/?id=%s' % job_id

    percent_complete = '0'
    while(percent_complete != '100.0'):
        time.sleep(2)
        percent_complete = requests.get(progress_url).text[1:-1]
        log.info("Job " + percent_complete + "% complete")

    result = requests.get('http://climateserv.servirglobal.net/chirps/getDataFromRequest/?id=%s' % job_id)
    log.info("result: " + str(result.text))

    avgs = compute_avg(json.loads(result.text)['data'], num_averaged_years, start_date, end_date, log)
    log.info(str(avgs))

    avg_of_avgs = avgs["historical"][1] / avgs["historical"][0]
    absolute_threshold = avg_of_avgs * threshold_factor
    term_avg = avgs['latest'][1]


    if(term_avg > absolute_threshold):
        outcome = "above"
    else:
        outcome = "below"

    print("%i&%s&%s&%s&%s&%s" % (200, WIT_ID, outcome, format(avg_of_avgs, '.5f'), format(term_avg, '.5f'), format(absolute_threshold, '.5f')))

    
    quit()


def compute_avg(data, num_averaged_years, start_date, end_date, log):
    '''
    Takes some NASA CHIRPS API JSON data, and performs some calculations on it.

    We want to find the average to
    '''
    avg_table = {}
    for year in range(0, num_averaged_years + 1): 
        avg_table[start_date - relativedelta(years=year), end_date - relativedelta(years=year)] = (0,0)

    for day in data:
        for a_range in avg_table.keys():
            date = datetime.datetime.strptime(day['date'], '%m/%d/%Y')
            if a_range[0] <= date <= a_range[1]:
                avg_table[a_range] = (avg_table[a_range][0] + 1, avg_table[a_range][1] + day['value']['avg']) #TODO test for cross-year ranges
                break

    log.debug(avg_table)

    historical_total = (0,0)
    latest_total = (0,0)
    for year in avg_table.keys():
        if year != (start_date, end_date):
            historical_total= (historical_total[0] + 1, historical_total[1] + avg_table[year][1])
        else:  
            latest_total = (latest_total[0] + 1, latest_total[1] + avg_table[year][1])

    return {"historical": historical_total, "latest": latest_total}


def loadArgs(args, enableLogging=False):  
    '''
    Schema for args is ['<WITID>', '<average_years>&<start>&<end>', 'threshold', 'topleft', 'edgelength']
    WITID is the ID of the WIT in question. Needed for callback.
    average_years is the number of years against which we are comparing. For example, the past 10 years.
    start is the start date of the term period
    end is the end date of the term period
    threshold is the threshold against which which we are comparing historical data.
    topleft is the lat lon pair of the top left of the square polygon that represents the geographic area under consideration.
    edgelength is the length of the edge of the square in question.
    
    for example:
    args = ['1', '10&1493344692&1495936692', '30000', '21.5331234,-3.1621234&0.14255']
    '''

    try:
        log = logging.getLogger(__name__)

        if not enableLogging:
            log.disabled = True

        WIT_ID = args[0]
        arg_trio = args[1].split("&")

        num_averaged_years = int(arg_trio[0])
        start_date = datetime.datetime.utcfromtimestamp(int(arg_trio[1]))
        end_date = datetime.datetime.utcfromtimestamp(int(arg_trio[2]))

        threshold_factor = int(args[2]) / 10000 #10000 = 100% 

        coordinates, edge_length = args[3].split('&')

        top_left_lat, top_left_lon = coordinates.split(',')
        top_left = (float(top_left_lat), float(top_left_lon))
        edge_length = float(edge_length)
        bottom_left = ((top_left[0] - edge_length), top_left[1])
        top_right = (top_left[0], (top_left[1] + edge_length))
        bottom_right = ((top_left[0] - edge_length), (top_left[1] + edge_length)) 
    except Exception as ex:
        print("Failed to load args. Exception: %s" % ex)
        quit()

    try:
        main(WIT_ID, 
             num_averaged_years, 
             start_date, 
             end_date, 
             threshold_factor, 
             top_left,
             bottom_left,
             bottom_right,
             top_right,
             log)
    except Exception as ex:
        print("Something weird happened. Exception: %s" % ex)
        quit()


if __name__ == "__main__":
    try:
        args = []
        args.append(os.environ['ARG0'])
        args.append(os.environ['ARG1'])
        args.append(os.environ['ARG2'])
        args.append(os.environ['ARG3'])
    except Exception as ex:
        print("Insufficient arguments provided. Exception: %s" % ex)
        quit()
    loadArgs(args)

