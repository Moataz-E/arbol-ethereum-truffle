#!/usr/bin/python

import requests
import json
import os
import datetime
import sys
import time


def dictify_vals(raw_values):
    """
    Takes as an argument a single string which has key value pairs encoded as
    individual lines and separated by the "," character.

    Encodes into a dictionary of ints:floats and returns said dictionary.
    """
    values_dict = {}
    for line in raw_values.contents[0].splitlines():
        try:
            key_val = line.strip().split(',')
            values_dict[int(key_val[0])] = float(key_val[1])
        except IndexError:
            pass
    return values_dict


def calculate_average(start_year, end_year, values_dict):
    """
    Takes yearly precipitation data from the dictionary, and returns
    the average preciptation for inclusive the range between start_year and end_year.
    """

    #TODO weight different months based on how many days are in them!
    sum = 0
    for year in range(start_year, end_year + 1):
        sum += values_dict[year]
    average = sum / ((end_year + 1) - start_year)
    return average


Exception requestFailed(status_code, URL)


def get_ghcnd_precip(start_date, end_date, locations, api_token, offset=1):
    """
    Get the GHCND precip levels for a given interval and location(s). Sum the precip levels and return.

{
    "metadata": {
        "resultset": {
            "offset": 1,
            "count": 837778,
            "limit": 1000
        }
    },
    "results": [
        {
            "date": "2010-05-01T00:00:00",
            "datatype": "PRCP",
            "station": "GHCND:AE000041196",
            "attributes": ",,S,",
            "value": 0
        },



    """
    URL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatype=PRCP&limit=1000&offset=%i&startdate=%s&enddate=%s&locationid=%s" % (offset, start_date, end_date, locations,)
    response = requests.get(URL, timeout=60, headers={'token': api_token})

    if response.status_code != 200:
        raise requestFailed(status_code, URL)

    #TODO handle api token related errors
    #handle other errors?

    metadata = response.json()['metadata']
    results = response.json()['results']

    precip_level = 0
    for result in results:
        precip_level += result['value']

    if metadata['resultset']['offset'] + metadata['resultset']['limit'] < metadata['resultset']['count']:
        time.sleep(500);
        return precip_level + get_ghcnd_precip(start_date, end_date, locations, api_token, offset + 1000)
    else:
        return precip_level



    
def main(wit_id, locationQuery, year, month, timescale, threshold_factor, num_averaged_years):
    """
    Hits NOAA's aggregate endpoint (for the given region, month, and timescale), and
    calculates whether the precipation levels for the term_year exceed the average of
    previous averaged_years number of years by the given threshold.

    Threshold is a factor of the precipitation level, so "10% above average" is 1.1, and
    "15% below average" is .85
    """
    
    precip_total = 0
    for year in range():
        try:
            ghcnd_precip = get_ghcnd_precip()
        except requestFailed as e:
            print("%i&%s&0&0&0&0&%s" % (r.status_code, wit_id, r.URL))
            quit()


    if response.status_code != 200:
        print("%i&%s&0&0&0&0" % (response.status_code, wit_id,))
        quit()

    soup = BeautifulSoup(response.content, "html.parser")
    raw_prcp_vals = soup.find("values") # "values" is the html element that marks the precipitation data.
    prcp_vals_dict = dictify_vals(raw_prcp_vals)
    avg_prcp = calculate_average(int(start_year), int(end_year), prcp_vals_dict)
    term_prcp = prcp_vals_dict[int(year)]
    absolute_threshold = float(threshold_factor) * avg_prcp

    if (term_prcp > absolute_threshold):
        outcome = "above"
    else:
        outcome = "below"

    print("%i&%s&%s&%s&%s&%s" % (200, wit_id, outcome, format(avg_prcp, '.5f'), format(term_prcp, '.5f'), format(absolute_threshold, '.5f'), ))


def test():
    """
    Makes several calls to main.

    Region 261 is corn belt.
    """
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1.5, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1.4, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1.3, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1.2, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1.1, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=1, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=.9, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=.8, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=.7, num_averaged_years=10)
    main(wit_id=1, region=261, year=2017, month=3, timescale=1, threshold_factor=.6, num_averaged_years=10)


if __name__ == "__main__":
    try:
        args = []
        args.append(os.environ['ARG0'])
        args.append(os.environ['ARG1'])
        args.append(os.environ['ARG2'])
        args.append(os.environ['ARG3'])
    except Exception as ex:
        print("failed to load args. Exception: &s" % ex)
        quit()
    

    # schema for args is ['<WITID>&API_token', '<average_years>&<start>&<end>', 'threshold', 'area']
    # args = ['1', '10&1493344692&1495936692', '30000', '261']

    argDuo = args[0].split("&")
    WITID = argDuo[0]
    APIToken = argsDuo[1]
    
    argTrio = args[1].split("&")
    numAveragedYears = int(argTrio[0])
    start = datetime.datetime.utcfromtimestamp(int(argTrio[1]))
    end = datetime.datetime.utcfromtimestamp(int(argTrio[2]))

    thresholdFactor = int(args[2]) / 10000 #10000 = 100% 

    locationQuery = int(args[3])

    main(WITID, locationQuery, start, end, num_averaged_years, threshold_factor)

