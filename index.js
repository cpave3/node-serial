'use strict';

const SerialPort = require('serialport');

SerialPort.list()
.then((data) => {
    data.forEach((row) => {
        console.log(row.comName);
    });
    var port = new SerialPort('/dev/tty.usbmodem14311', {
        baudRate: 9600
    });

    port.write('0,255,0', function(err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('message written');
    });
})
.catch(err => console.log(err));




