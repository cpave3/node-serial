'use strict';

const SerialPort = require('serialport');
const readline =  require('readline');
const pcol = require('parse-color');
let port;
const devices = {};
let device;

SerialPort.list()
.then((data) => {
    let i = 0;
    data.forEach((row) => {
        console.log(`[${i}] ${row.comName}`);
        devices[i] = row;
        i++;
    });
    const portPrompt = readline.createInterface(process.stdin, process.stdout);
    portPrompt.setPrompt('Select your device: ');
    portPrompt.prompt();
    portPrompt.on('line', (portNumber) => {
        if (devices[portNumber]) {
            device = devices[portNumber].comName;
        }
        portPrompt.close();
        //console.log('here', port, devices, device);
        port = new SerialPort(device, {
            baudRate: 9600
        });
        port.on('open', function() {
            console.log('[*] Connection open');
            awaitInput(); 
        });
    })

})
.catch(err => console.log(err));

function awaitInput() {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('Beacon >> ');
    rl.prompt();
    rl.on('line', (line) => {
        switch (line) {
        case 'exit':
        case 'close':
        case 'quit':
        case 'q':
            console.log('[!] Quitting...');
            process.exit();
            break;
        case 'available':
            sendData('0,255,0');
            break;
        case 'away':
            sendData('255,0,0');
            break;
        default:
            if (pcol(line).rgb) {
                sendData(pcol(line).rgb.join(','));
            } else {
                sendData(line);
            }
            break;
        }
        rl.close();
        awaitInput();
    });
}

function sendData(input) {
    if (port) {
        port.write(input, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        //console.log('[*] Command Sent');
        });
        port.on('data', function(data) {
            //console.log(data);
        });
    }
}
