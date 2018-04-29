#!/usr/bin/python

import requests
import os
import datetime
import time





script_start_time = datetime.datetime.now()
five_minutes = datetime.timedelta(minutes=5)
time_buffer = .1 # percentage of total script time that we bail at.

os.environ['ARG0'] = "qcAsfcBAUdNZBzzzGRhfMFyIgkegjYIl"
os.environ['ARG1'] = str(datetime.datetime.now().timestamp() - 33696000)) #13 months ago
os.environ['ARG2'] = str(datetime.datetime.now().timestamp() - 31104000)) #12 months ago
os.environ['ARG3'] = str(-.1)
os.environ['ARG4'] = 

api_token = os.environ['ARG0'] # Runtime params is just the api token.
start_term = datetime.datetime.fromtimestamp(int(os.environ['ARG1'])) # convert to datetime from unix timestamp
end_term = datetime.datetime.fromtimestamp(int(os.environ['ARG2'])) # convert to datetime from unix timestamp
threshold = float(os.environ['ARG3']) # this will be negative or positive
location = os.environ['ARG4']
ID = os.environ['ARG5']

baseURL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&limit=1000&location=' + location
headers = '{"ticket": %s}' % (api_token,)


def check_exit(output):
    """
    This script has only 5 minutes to run. We check if time is almost over and bail if it is.
    """
    if ((datetime.datetime.now() - script_start_time) > (five_minutes - (five_minutes * time_buffer))):
        print(output)
        quit()


def yearly_precip(year_itr):
    """
    year_itr is the number of years less than the term start year that we are looking at. So if year_itr is 4 and the term
    start is 2019, then this function will return the precipitation starting in 2015 and goign for the duration fo the term.
    """

    historical_start = start_term - datetime.timedelta(years=year_itr)
    historical_end = end_term - datetime.timedelta(years=year_itr)

    time_param = '&startdate=%s&enddate=%s' % (historical_start.strftime("%Y-%m-%d"), historical_end.strftime("%Y-%m-%d"),)

    response_json = requests.get(baseURL + time_param, headers=headers).json()


    #TODO check limit and deal with that somehow.
    #TODO check status_code

    total_precip = 0

    for station_day in response_json["results"]:
    	total_precip += station_dat["value"]
 
    return total_precip


#############################

total_historical_precip = 0

for year_itr in range(1, 11):
    # check_exit('ID=%s&status=iterating&yearitr=%s&average=%s' % (ID, yearitr, total_historical_precip)) see if we're out of time and bail if we are
    total_historical_precip += yearly_precip(year_itr)

historical_average_percip = total_historical_precip / 10 #TODO safe math type stuff?
term_precip = yearly_precip(0) # get the term period

# format is "<0 or 1>&<ID>&<outcome or errors>"

if (term_precip < historical_average_precip + (historical_average_precip * threshold)):
	print("1&%s&above" % (ID,)) #TODO include more data for debugging and records
else:
	print("1&%s&below" % (ID,))

quit()

