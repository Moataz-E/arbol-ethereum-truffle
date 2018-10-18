#CHIRPS dataset via climateSERV

#API documentation  https://climateserv.readthedocs.io/en/latest/api.html

#query format {{ base api url }}/[MethodName]/?param1=value1&param2=value2&...paramN=valueN



#https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=04/01/2018&endtime=04/30/2018&intervaltype=0&operationtype=5&callback=successCallback&dateType_Category=default&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}
#returns "503dfe8e-8292-4ce7-9441-040c90e28187"
# https://climateserv.servirglobal.net/chirps/getDataRequestProgress?id=503dfe8e-8292-4ce7-9441-040c90e28187
#returns 100%


https://climateserv.servirglobal.net/chirps/submitDataRequest/?datatype=0&begintime=04/01/2018&endtime=04/30/2018&intervaltype=0&operationtype=5&callback=successCallback&dateType_Category=default&isZip_CurrentDataType=false&geometry={"type":"Polygon","coordinates":[[[21.533203124999996,-3.1624555302378496],[21.533203124999996,-6.489983332670647],[26.279296874999986,-5.441022303717986],[26.10351562499999,-2.635788574166625],[21.533203124999996,-3.1624555302378496]]]}


begintime = '04/01/2018'
endtime = '04/30/2018'
intervaltype = '0' #0 = daily, 1 = monthly?
operationtype =  '5' #[[0, "max", "Max"], [1, "min", "Min"], [2, "median", "Median"], [3, "range", "Range"], [4, "sum", "Sum"], [5, "avg", "Average"]]
isZip_CurrentDataType = 'false' #whether or not to zip up the response "and return a full dataset" (?).


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

