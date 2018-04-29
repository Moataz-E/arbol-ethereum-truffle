#!/usr/bin/python

import requests
from bs4 import BeautifulSoup
import os
import datetime
import cbor2

try:
    args = []
    args.append(os.environ['ARG0'])
    args.append(os.environ['ARG1'])
    args.append(os.environ['ARG2'])
    args.append(os.environ['ARG3'])
    print(args)
except Exception as ex:
    print(ex)
    quit()

#b'\\xef\\xbf\\xbd\\x01\\\\n\\x1aY\\x02W\\xef\\xbf\\xbd\\x1aY)\\xef\\xbf\\xbd\\xef\\xbf\\xbd\\x19u0\\x19\\x01\\x05\\xef\\xbf\\xbd





#x = bytes.fromhex("9f010a1a590226811a5929b381197530190105ff")
#sys.stdout.buffer.write(x)


#j = cbor2.dumps(['666', 10, 1488454000, 1492889914, 1000000, "261"])
'''
try:
    args = cbor2.loads(b'9f010a1a590224cf1a5929b1cf197530190105ff') #deserialize a CBOR containing all the args.
    print(args)
except:
    print("couldn't load cbor")
 #   print("failed to load CBOR from environment variable")
  #  quit()



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
'''
