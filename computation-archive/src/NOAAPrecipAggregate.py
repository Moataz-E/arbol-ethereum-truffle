import requests
from bs4 import BeautifulSoup


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
    sum = 0
    for year in range(start_year, end_year + 1):
        sum += values_dict[year]
    average = sum / ((end_year + 1) - start_year)
    return average

    
def main(timescale, region, month, threshold, term_year, averaged_years):
    """
    Hits NOAA's aggregate endpoint (for the given region, month, and timescale), and
    calculates whether the precipation levels for the term_year exceed the average of
    previous averaged_years number of years by the given threshold.

    Threshold is a factor of the precipitation level, so "10% above average" is 1.1, and
    "15% below average" is .85
    """
    start_year = term_year - averaged_years
    end_year = term_year - 1
    result = requests.get("https://www.ncdc.noaa.gov/cag/regional/time-series/mugl.xml?parameter=pcp&timescale=%s&region=%s&month=%s" % (timescale, region, month,))

    if result.status_code != 200:
        print(result.status_code)
        quit()

    soup = BeautifulSoup(result.content, "html.parser")
    raw_prcp_vals = soup.find("values") # "values" is the html element that marks the precipitation data.
    prcp_vals_dict = dictify_vals(raw_prcp_vals)
    avg_prcp = calculate_average(int(start_year), int(end_year), prcp_vals_dict)
    term_prcp = prcp_vals_dict[int(term_year)]

    if (term_prcp > float(threshold) * avg_prcp):
        print("average: %s, term: %s, threshold: %s, result: above" % (str(avg_prcp), str(term_prcp), str(threshold * avg_prcp),))
    else:
        print("average: %s, term: %s, threshold: %s, result: below" % (str(avg_prcp), str(term_prcp), str(threshold * avg_prcp),))


def test():
    """
    Makes several calls to main.

    Region 261 is corn belt.
    """

    main(timescale=1, region=261, month=3, threshold=1.5, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=1.4, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=1.3, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=1.1, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=1, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=.9, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=.8, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=.7, term_year=2017, averaged_years=10)
    main(timescale=1, region=261, month=3, threshold=.6, term_year=2017, averaged_years=10)    

test()