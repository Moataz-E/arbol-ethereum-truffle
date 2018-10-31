FROM frolvlad/alpine-python3
MAINTAINER Ben "bandre@gmail.com"

COPY NASACHIRPS.py /

RUN pip3 install requests
RUN pip3 install python-dateutil

CMD python3 ./NASACHIRPS.py