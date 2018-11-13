FROM frolvlad/alpine-python2
MAINTAINER Ben "bandre@gmail.com"

COPY NASACHIRPS.py /

RUN pip install requests
RUN pip install python-dateutil

CMD python ./NASACHIRPS.py