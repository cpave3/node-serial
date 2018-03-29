'use strict';

const SerialPort = require('serialport');
const readline =  require('readline');
const pcol = require('parse-color');
const Preferences = require('preferences');
 
let port;
const devices = {};
let device;
const pref = new Preferences('com.bytedriven.beacon', {
});


if (!pref.device) {
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
                pref.device = device;
                portPrompt.close();
                connectDevice();        
            }
            
        })

    })
    .catch(err => console.log(err));
} else {
    connectDevice();
}

function connectDevice() {
    port = new SerialPort(pref.device, {
        baudRate: 9600
    });
    port.on('open', function() {
        console.log('[*] Connection open');
        awaitInput();
    });
}

function awaitInput() {
    // Break readline stuff out of this function, causing listener error
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt(`[${pref.device}] > `);
    rl.prompt();
    rl.on('line', (line) => {
        switch (line) {
        case 'clear.device':
            pref.device = null;
        case 'exit':
        case 'close':
        case 'quit':
        case 'q':
            console.log('[!] Quitting...');
            process.exit();
            break;
        case 'open':
        case 'available':
            sendData('0,200,25');
            break;
        case 'dnd':
        case 'busy':
            sendData('255,0,0');
            break;
	case 'personal':
	case 'break':
	    sendData('0,0,255');
	    break;
        case 'afk':
        case 'brb':
	case 'away':
	    sendData('255,25,0');
	    break;
	case 'pink':
	    sendData('255,30,30');
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
