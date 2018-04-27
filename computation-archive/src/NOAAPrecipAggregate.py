#!/usr/bin/python

import requests
from bs4 import BeautifulSoup
import os
import datetime
import cbor2

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

    
def main(wit_id, region, year, month, timescale, threshold_factor, num_averaged_years):
    """
    Hits NOAA's aggregate endpoint (for the given region, month, and timescale), and
    calculates whether the precipation levels for the term_year exceed the average of
    previous averaged_years number of years by the given threshold.

    Threshold is a factor of the precipitation level, so "10% above average" is 1.1, and
    "15% below average" is .85
    """
    start_year = year - num_averaged_years
    end_year = year - 1
    response = requests.get("https://www.ncdc.noaa.gov/cag/regional/time-series/mugl.xml?parameter=pcp&timescale=%s&region=%s&month=%s" % (timescale, region, month,), timeout=60)

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
#    j = cbor2.dumps(['666', 10, 1488454000, 1492889914, 1000000, "261"])

    try:
        args = cbor2.loads(os.environ['ARG0']) #deserialize a CBOR containing all the args.
    except:
        print "failed to load CBOR from environment variable"
        quit()

    WITID = args[0]
    num_averaged_years = args[1]
    start = datetime.datetime.utcfromtimestamp(args[2])
    end = datetime.datetime.utcfromtimestamp(args[3])
    threshold_factor = args[4] / 1000000 #PPM -- parts per million. 
    region = args[5]

    timescale = end.month - start.month + 1 #number of months between start and end, rounded off. If both dates are in the same month, 1.
    if timescale <= 0:
        timescale += 12

    main(WITID, region, end.year, end.month, timescale, threshold_factor, num_averaged_years)

