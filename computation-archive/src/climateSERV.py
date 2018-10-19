#CHIRPS dataset via climateSERV

#API documentation  https://climateserv.readthedocs.io/en/latest/api.html

#query format {{ base api url }}/[MethodName]/?param1=value1&param2=value2&...paramN=valueN



#https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=04/01/2018&endtime=04/30/2018&intervaltype=0&operationtype=5&callback=successCallback&dateType_Category=default&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}
#returns "503dfe8e-8292-4ce7-9441-040c90e28187"
# https://climateserv.servirglobal.net/chirps/getDataRequestProgress?id=503dfe8e-8292-4ce7-9441-040c90e28187
#returns 100%


https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=04/01/2018&endtime=04/30/2018&intervaltype=0&operationtype=5&callback=successCallback&dateType_Category=default&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}



INTERVAL_TYPE = '0' #0 = daily, 1 = monthly?
OPERATION_TYPE =  '5' #[[0, "max", "Max"], [1, "min", "Min"], [2, "median", "Median"], [3, "range", "Range"], [4, "sum", "Sum"], [5, "avg", "Average"]]
ZIP = 'false' # whether or not to zip up the response "and return a full dataset" (?).


'''
'datatype'      // (int), the unique datatype number for the dataset which this request operates on
'begintime'     // (string), startDate for processing interval, format ("MM/DD/YYYY")
'endtime'       // (string), endDate for processing interval, format ("MM/DD/YYYY")
'intervaltype'  // (int), enumerated value that represents which type of time interval to process (daily, monthly, etc) (This enumeration is currently hardcoded in the mark up language of the current client).
'operationtype'         // (int), enumerated value that represents which type of statistical operation to perform on the dataset, see api call 'getParameterTypes/' for the list of currently available types.
// Either 'geometry' by itself or these other two params together, 'layerid' and 'featureids' are required
'geometry'(optional)// (object), the geometry that is defined by the user on the current client
'layerid'(optional) // the layerid that is selected by the by the user on the current client
'featureids'(optional)  // the featureids as selected by the user on the current client
'isZip_CurrentDataType'(optional) // (string), Leaving this blank converts to 'False' on the server.  Sending anything through equates to a 'True' value on the server.  This lets the server know that this is a job to zip up and return a full dataset.
'''
URL = 'https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=%s&endtime=%s&intervaltype=%s&operationtype=%s&dateType_Category=default&isZip_CurrentDataType=%s&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}

import requests

def main(WIT_ID, num_averaged_years=10, start_date, end_date, threshold_factor, top_left, bottom_left, bottom_right, top_right):
    

    square = '[[%f,%f],[%f,%f],[%f,%f],[%f,%f]]' % (top_left[0], top_left[1], \
    		 									    bottom_left[0], bottom_left[1], 
    		 									    bottom_right[0], bottom_right[1], 
    		 									    top_right[0], top_right[1])

    request_url = 'https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=%s&endtime=%s&intervaltype=%s\
    &operationtype=%s&dateType_Category=default&isZip_CurrentDataType=%s&geometry={"type":"Polygon","coordinates":[%s]}' % 
    (start_date.strftime("%m/%d/%Y"), end_date.strftime("%m/%d/%Y"), INTERVAL_TYPE, OPERATION_TYPE, ZIP, square)

    job_id = requests.get(request_url)

    print(job_id)

	progress_url = 'https://climateserv.servirglobal.net/chirps/getDataRequestProgress/?id=%s' % job_id

	percent_complete = requests.get(progress_url)
    while(percent_complete != '100.0'):
    	print(percent_complete)
    	time.sleep(2)

    result = requests.get('http://climateserv.servirglobal.net/chirps/getDataFromRequest/?id=%s' % job_id)
    print result


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
    

    # schema for args is ['<WITID>', '<average_years>&<start>&<end>', 'threshold', 'topleft', 'edgelength']
    # WITID is the ID of the WIT in question. Needed for callback.
    # average_years is the number of years against which we are comparing. For example, the past 10 years.
    # start is the start date of the term period
    # end is the end date of the term period
    # threshold is the threshold against which which we are comparing historical data.
    # topleft is the lat lon pair of the top left of the square polygon that represents the geographic area under consideration.
    # edgelength is the length of the edge of the square in question.
    #
    # for example:
    # args = ['1', '10&1493344692&1495936692', '30000', '21.5331234,-3.1621234', '0.14255']

    WIT_ID = args[0]
    arg_trio = args[1].split("&")

    num_averaged_years = int(arg_trio[0])
    start_date = datetime.datetime.utcfromtimestamp(int(arg_trio[1]))
    end_date = datetime.datetime.utcfromtimestamp(int(arg_trio[2]))

    threshold_factor = int(args[2]) / 10000 #10000 = 100% 

	top_left_lat, top_left_lon = args[3].split(',')
	top_left = (float(top_left_lat), float(top_left_lon))
    edge_length = args[4]
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
    	 top_right)

