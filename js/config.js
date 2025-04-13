
import { StarScene } from "../scenes/StarScene.js";
import { SandboxScene } from "../scenes/SandboxScene.js";


export var config = {
    width: 360,
    height: 800,
    scene: [StarScene],
    // scene: [SandboxScene],
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    canvasStyle: 'image-rendering: pixelated;'
};