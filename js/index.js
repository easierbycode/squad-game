
import {config} from './config.js';


// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    document.getElementById('deviceready').classList.add('ready');

    window.game = new Phaser.Game(config);

    document.getElementById('app').style.display = 'none';  
}


if (!window.cordova) {
    setTimeout(() => {
        const e = document.createEvent('Events')
        e.initEvent('deviceready', true, false);
        document.dispatchEvent(e);
    }, 50);
}