from NASACHIRPS import *

logging.basicConfig(level=logging.INFO)
    
loadArgs(['1', '10&1493344692&1495936692', '8000', '21.5331234,-3.1621234&0.14255'], True) # 2017
#loadArgs(['2', '10&1571803184&1574481584', '9000', '-5.4240329,-45.317487', '7.14255'], True)  #in the future, should fail.
loadArgs(['3', '10&1516679984&1517198384', '10000', '45.2763928,31.6500595&0.314255'], True)
loadArgs(['4', '10&1517198384&1527566384', '9500', '43.9848174,25.5731757&0.514255'], True)
#loadArgs(['5', '10&1454039984&1485662384', '15000', '-26.1901181,135.4449302', '0.154255'], True) #exactly 365 days....???
#loadArgs(['6', '10&1517198384&1548734384', '10000', '19.5940014,71.975564', '0.1255'], True)      #started in past, ends in future
loadArgs(['7', '10&1493344692&1495936692', '10200', '24.8782129,102.2600743&10.14255'], True)
loadArgs(['8', '10&1493344692&1495936692', '9900', '32.3085282,105.843704&1.255'], True)
loadArgs(['9', '10&1493344692&1495936692', '9100', '39.7219592,-91.5095299&0.014255'], True)
loadArgs(['10', '10&1493344692&1495936692', '5000', '39.6557347,52.9795533&0.3255'], True)

