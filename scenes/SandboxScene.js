
import { config } from "../js/config.js"
import { Player } from "../sprites/player.js";
import Stars from "../sprites/stars.js"
import { GeekStar } from "../sprites/geek-star.js";
import { PS5Controller } from "../sprites/ps5-controller.js";
import { HeadphoneInvader } from "../sprites/headphone-invader.js";
import { CyberOctopus } from "../sprites/cyber-octopus.js";


export class SandboxScene extends Phaser.Scene {
    constructor() {
        super('SandboxScene'); 

        this.angle1 = 0;
    }

    preload() {
        this.load.audio('audio_beam', '../assets/sounds/beam.mp3')
        this.load.audio('audio_explosion', '../assets/sounds/explosion.mp3')
        this.load.audio('audio_pickup', '../assets/sounds/pickup.mp3')
        this.load.image( 'bby-ship', '../assets/images/best-buy-ship.png')
        this.load.image( 'blue', '../assets/images/blue.png')
        this.load.image( 'geek-bullet', '../assets/images/geek-bullet.png')
        this.load.image( 'geek-e', '../assets/images/geek-e.png')
        this.load.image( 'geek-g', '../assets/images/geek-g.png')
        this.load.image( 'geek-k', '../assets/images/geek-k.png')
        this.load.image( 'geekstar-dead', '../assets/images/geekstar-dead.png')
        this.load.image( 'geekstar-grey', '../assets/images/geekstar-grey.png')
        this.load.image( 'red', '../assets/images/red.png')
        this.load.image('squad-s', '../assets/images/squad-s.png')
        this.load.image('squad-q', '../assets/images/squad-q.png')
        this.load.image('squad-u', '../assets/images/squad-u.png')
        this.load.image('squad-a', '../assets/images/squad-a.png')
        this.load.image('squad-d', '../assets/images/squad-d.png')
        this.load.image( 'star', '../assets/images/star.png' )
        this.load.spritesheet('beam', '../assets/spritesheets/sperm.png', {
            frameWidth: 6,
            frameHeight: 22
        })
        this.load.spritesheet('beam-impact', '../assets/spritesheets/sperm-impact.png', {
            frameWidth: 18,
            frameHeight: 28
        })
        this.load.spritesheet('cyber-octopus', '../assets/spritesheets/cyber-octopus.png', {
            frameWidth: 29,
            frameHeight: 29
        })
        this.load.spritesheet('geekstar', '../assets/spritesheets/gs-logo.png', {
            frameWidth: 170,
            frameHeight: 105
        })
        this.load.spritesheet('geek-ellipsis', '../assets/spritesheets/geek-ellipsis.png', {
            frameWidth: 15,
            frameHeight: 10
        })
        this.load.spritesheet('headphone-invader', '../assets/spritesheets/headphone-invader.png', {
            frameWidth: 765,
            frameHeight: 569
        })
        this.load.spritesheet('headphone-invader-particles', '../assets/spritesheets/headphone-invader-particles.png', {
            frameWidth: 45,
            frameHeight: 45
        })
        this.load.spritesheet('ps5-bullet', '../assets/spritesheets/ps5-bullet.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('ps5-controller', '../assets/spritesheets/ps5-controller.png', {
            frameWidth: 22,
            frameHeight: 13
        })
        this.load.spritesheet( 'ship-boy', '../assets/spritesheets/ship-boy.png', {
            frameWidth: 117,
            frameHeight: 142
        })
    }

    create() {
        new Stars({ scene: this })

        this.anims.create({
            key: 'beam_anim',
            frames: this.anims.generateFrameNumbers('beam'),
            frameRate: 20,
            repeat: -1
        })

        this.player = new Player(this, config.width / 2, config.height - 64)

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        // this.anims.create({
        //     key: 'beam_anim',
        //     frames: this.anims.generateFrameNumbers('beam'),
        //     frameRate: 20,
        //     repeat: -1
        // })

        // this.ball2 = this.add.image(180, -53, 'geek-ellipsis')

        // enemy projectiles
        this.enemyProjectiles = this.add.group()

        this.physics.add.overlap(this.enemyProjectiles, this.player, (e, p) => {
            this.cameras.main.shake(100, 0.025)
        })

        // group to hold all our projectiles
        this.projectiles = this.add.group()

        this.sentinels = this.add.group()

        this.physics.add.overlap(this.sentinels, this.projectiles, (s, p) => {
            s.damage( s, p );
        })

        // this.sentinels.add( new PS5Controller(this, 43, -100) );
        // this.sentinels.add( new PS5Controller(this, 317, -100) );

        // -285
        // this.sentinels.add( new HeadphoneInvader(this, (this.game.config.width / 2), -285) );
        this.sentinels.add( new CyberOctopus(this, (this.game.config.width / 2), -29) );

        
    }

    // //  loop which runs continuously
    update() {

        if (this.player.alpha >= 0.3) {
            this.player.movePlayerManager();

            if (this.input.activePointer.isDown || Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                    this.player.shoot();
            }
        }
        for (var i = 0; i < this.projectiles.getChildren().length; i++) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }

        for (var i = 0; i < this.enemyProjectiles.getChildren().length; i++) {
            var p = this.enemyProjectiles.getChildren()[i];
            p.update();
        }
        
    }
}