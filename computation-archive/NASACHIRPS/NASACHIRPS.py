import requests
import datetime
import time
import json
from dateutil.relativedelta import relativedelta
import logging


    #TODO use bigfloat for decimals
    #TODO make work for periods longer than a year
    #TODO write some tests
    #TODO better validation
    #TODO print something sensible if there's a timeout / API fail
    #TODO fuzzing?


def main(WIT_ID, num_averaged_years, start_date, end_date, threshold_factor, top_left, bottom_left, bottom_right, top_right, log):
    '''
    Make a call to the NASA climateSERV API, access CHIRPS data, etc

    Full climateserv documentation: https://climateserv.readthedocs.io/en/latest/api.html

    '''


    square = '[[%f,%f],[%f,%f],[%f,%f],[%f,%f]]' % (top_left[0], top_left[1], \
    		 									    bottom_left[0], bottom_left[1], 
    		 									    bottom_right[0], bottom_right[1], 
    		 									    top_right[0], top_right[1])

    request_url = (
        'https://climateserv.servirglobal.net/chirps/submitDataRequest/?'
        'datatype=0'                  # (int), the unique datatype number for the dataset which this request operates on
        '&begintime=%s'               # (string), startDate for processing interval, format ("MM/DD/YYYY")
        '&endtime=%s'                 # (string), endDate for processing interval, format ("MM/DD/YYYY")
        '&intervaltype=0'            # (int), enumerated value that represents which type of time interval to process (daily, monthly, etc). 0 = daily
        '&operationtype=5'           # (int), enumerated value that represents which type of statistical operation to perform on the dataset ...
                                      # ... [[0, "max", "Max"], [1, "min", "Min"], [2, "median", "Median"], [3, "range", "Range"], [4, "sum", "Sum"], [5, "avg", "Average"]]
        '&dateType_Category=default'  
        '&geometry='                  # (object), the geometry that is defined by the user on the current client
            '{"type":"Polygon",'
            '"coordinates":[%s]}' 
        %
        (
            (start_date - relativedelta(years=num_averaged_years)).strftime("%m/%d/%Y"), 
            end_date.strftime("%m/%d/%Y"), 
            square
        )
    )
    log.info("\n\n\n\n")
    log.info("Querying API")
    log.info(str(request_url))

    job_id = requests.get(request_url).text[2:-2]
    progress_url = 'https://climateserv.servirglobal.net/chirps/getDataRequestProgress/?id=%s' % job_id

    percent_complete = '0'
    while(percent_complete != '100.0'):
        time.sleep(2)
        percent_complete = requests.get(progress_url).text[1:-1]
        log.info("Job " + percent_complete + "% complete")

    result = requests.get('http://climateserv.servirglobal.net/chirps/getDataFromRequest/?id=%s' % job_id)
    log.debug(str(result.text))

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

    
    #quit()


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
    args = ['1', '10&1493344692&1495936692', '30000', '21.5331234,-3.1621234', '0.14255']
    '''

    log = logging.getLogger(__name__)

    if not enableLogging:
        log.disabled = True

    WIT_ID = args[0]
    arg_trio = args[1].split("&")

    num_averaged_years = int(arg_trio[0])
    start_date = datetime.datetime.utcfromtimestamp(int(arg_trio[1]))
    end_date = datetime.datetime.utcfromtimestamp(int(arg_trio[2]))

    threshold_factor = int(args[2]) / 10000 #10000 = 100% 

    top_left_lat, top_left_lon = args[3].split(',')
    top_left = (float(top_left_lat), float(top_left_lon))
    edge_length = float(args[4])
    bottom_left = ((top_left[0] - edge_length), top_left[1])
    top_right = (top_left[0], (top_left[1] + edge_length))
    bottom_right = ((top_left[0] - edge_length), (top_left[1] + edge_length)) 

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


if __name__ == "__main__":
    try:
        args = []
        args.append(os.environ['ARG0'])
        args.append(os.environ['ARG1'])
        args.append(os.environ['ARG2'])
        args.append(os.environ['ARG3'])
        args.append(os.environ['ARG4'])
    except Exception as ex:
        print("failed to load args. Exception: &s" % ex)
        quit()
    loadArgs(args)

