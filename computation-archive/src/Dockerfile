FROM frolvlad/alpine-python3
MAINTAINER Ben "bandre@gmail.com"

COPY NOAAPrecipAggregate.py /

RUN pip3 install requests
RUN pip3 install bs4
CMD python ./NOAAPrecipAggregate.py
