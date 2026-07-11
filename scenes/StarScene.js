
import { config } from "../js/config.js"
import { CyberOctopus } from "../sprites/cyber-octopus.js";
import { Explosion } from "../sprites/explosion.js";
import { GeekCar } from "../sprites/geek-car.js";
import { GeekStar } from "../sprites/geek-star.js";
import { HeadphoneInvader } from "../sprites/headphone-invader.js";
import { Laptop } from "../sprites/laptop.js";
import { Player } from "../sprites/player.js"
import { PS5Controller } from "../sprites/ps5-controller.js";
import Stars from "../sprites/stars.js"
import { WrongPassword } from "../sprites/wrong-password.js";


export class StarScene extends Phaser.Scene {
    constructor() {
        super('StarScene'); 
    }

    preload() {

        this.load.setBaseURL('https://easierbycode.com/squad-game/');

        this.load.audio('audio_beam', 'assets/sounds/beam.mp3')
        this.load.audio('audio_explosion', 'assets/sounds/explosion.mp3')
        this.load.audio('audio_pickup', 'assets/sounds/pickup.mp3')
        this.load.audio('rudy_saved', 'assets/sounds/rudy-saved.mp3')
        // this.load.image( 'bby-ship', 'assets/images/best-buy-ship.png')
        this.load.image( 'bby-ship', 'assets/images/tag.png')
        this.load.image( 'blue', 'assets/images/blue.png')
        this.load.image( 'geek-bullet', 'assets/images/geek-bullet.png')
        this.load.image( 'geek-car', 'assets/images/geek-car.png')
        this.load.image( 'geek-e', 'assets/images/geek-e.png')
        this.load.image( 'geek-g', 'assets/images/geek-g.png')
        this.load.image( 'geek-k', 'assets/images/geek-k.png')
        this.load.image( 'geekstar-dead', 'assets/images/geekstar-dead.png')
        this.load.image( 'geekstar-grey', 'assets/images/geekstar-grey.png')
        this.load.image('octopus-particles-0', 'assets/images/octopus-particles-0.png')
        this.load.image('octopus-particles-1', 'assets/images/octopus-particles-1.png')
        this.load.image( 'red', 'assets/images/red.png')
        this.load.image('squad-s', 'assets/images/squad-s.png')
        this.load.image('squad-q', 'assets/images/squad-q.png')
        this.load.image('squad-u', 'assets/images/squad-u.png')
        this.load.image('squad-a', 'assets/images/squad-a.png')
        this.load.image('squad-d', 'assets/images/squad-d.png')
        this.load.image( 'star', 'assets/images/star.png' )
        this.load.spritesheet('beam', 'assets/spritesheets/sperm.png', {
            frameWidth: 6,
            frameHeight: 22
        })
        this.load.spritesheet('beam-impact', 'assets/spritesheets/sperm-impact.png', {
            frameWidth: 18,
            frameHeight: 28
        })
        this.load.spritesheet('cyber-octopus', 'assets/spritesheets/cyber-octopus.png', {
            frameWidth: 29,
            frameHeight: 29
        })
        this.load.spritesheet('explosion', 'assets/spritesheets/explosion.png', {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet('geek-ellipsis', 'assets/spritesheets/geek-ellipsis.png', {
            frameWidth: 15,
            frameHeight: 10
        })
        this.load.spritesheet('geekstar', 'assets/spritesheets/gs-logo.png', {
            frameWidth: 170,
            frameHeight: 105
        })
        this.load.spritesheet('headphone-invader', 'assets/spritesheets/headphone-invader.png', {
            frameWidth: 191,
            frameHeight: 142
        })
        this.load.spritesheet('headphone-invader-particles', 'assets/spritesheets/headphone-invader-particles.png', {
            frameWidth: 45,
            frameHeight: 45
        })
        this.load.spritesheet('laptop', 'assets/spritesheets/laptop.png', {
            frameWidth: 74,
            frameHeight: 58
        })
        this.load.spritesheet('laptop-particles', 'assets/spritesheets/laptop-particles.png', {
            frameWidth: 2,
            frameHeight: 2
        })
        this.load.spritesheet('ms-logo-particles', 'assets/spritesheets/ms-logo-particles.png', {
            frameWidth: 10,
            frameHeight: 8
        })
        this.load.spritesheet('octopus', 'assets/spritesheets/octopus.png', {
            frameWidth: 21,
            frameHeight: 24
        })
        this.load.spritesheet('octopus-particles', 'assets/spritesheets/octopus-particles.png', {
            frameWidth: 16,
            frameHeight: 29
        })
        this.load.spritesheet('password-wrong-particles', 'assets/spritesheets/password-wrong-particles.png', {
            frameWidth: 2,
            frameHeight: 2
        })
        this.load.spritesheet('ps5-bullet', 'assets/spritesheets/ps5-bullet.png', {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet('ps5-controller', 'assets/spritesheets/ps5-controller.png', {
            frameWidth: 22,
            frameHeight: 13
        })
        this.load.spritesheet('ps5-controller-particles', 'assets/spritesheets/ps5-controller-particles.png', {
            frameWidth: 2,
            frameHeight: 2
        })
        this.load.spritesheet('rudy', 'assets/spritesheets/rudy.png', {
            frameWidth: 17,
            frameHeight: 29
        })
        this.load.spritesheet( 'ship-boy', 'assets/spritesheets/ship-boy.png', {
            frameWidth: 117,
            frameHeight: 142
        })
        this.load.spritesheet( 'wrong-password', 'assets/spritesheets/wrong-password.png', {
            frameWidth: 30,
            frameHeight: 22
        })
    }

    create() {
        new Stars({ scene: this })

        this.explosionSound = this.sound.add( 'audio_explosion', {
            volume: 0.4
        })
        this.savedSound = this.sound.add( 'rudy_saved', {
            volume: 0.65
        })

        this.anims.create({
            key: 'beam_anim',
            frames: this.anims.generateFrameNumbers('beam'),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion'),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        })
        this.anims.create({
            key: 'octopus',
            frames: this.anims.generateFrameNumbers( 'octopus' ),
            frameRate: 2,
            repeat: -1
        })
        this.anims.create({
            key: 'parachute',
            frames: this.anims.generateFrameNumbers( 'rudy' ),
            frameRate: 6,
            repeat: -1
        })

        this.player = new Player(this, config.width / 2, config.height - 64)

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        // enemy projectiles
        this.enemyProjectiles = this.add.group()

        this.physics.add.overlap(this.enemyProjectiles, this.player, (a, b) => {
            // The takeover is now driven by the geek-star's death, not by its
            // projectiles — a hit just rattles the camera.
            if (!this.takeoverStarted)  this.cameras.main.shake(100, 0.025)
        })

        // group to hold all our projectiles
        this.projectiles = this.add.group()

        this.sentinels = this.add.group()

        this.geekCar = new GeekCar(this, -587, 35)
        this.sentinels.add( this.geekCar )

        this.physics.add.overlap(this.sentinels, this.projectiles, (s, p) => {
            s.damage( s, p );
        })

        this.group = this.physics.add.group();

        this.physics.add.overlap(this.group, this.projectiles, (p, g) => {
            p.destroy();
        })

        // ENEMIES

        // create a grid of CyberOctopus spaced evenly
        for (var i = 0; i < 5; i++) {
            let y = -50;
            if (i % 2 == 0)  y = -98;

            let o = new CyberOctopus(this, 60 + (i * 50), y);

            this.sentinels.add( o );
        }

        // create Laptop
        this.sentinels.add( new Laptop(this, 26, -442) )
        this.sentinels.add( new Laptop(this, 100, -500) )
        this.sentinels.add( new Laptop(this, 174, -558) )

        // create Wrong Password
        this.sentinels.add( new WrongPassword(this, 26, -642) )
        this.sentinels.add( new WrongPassword(this, 100, -700) )
        this.sentinels.add( new WrongPassword(this, 174, -758) )

        // create GeekStar
        this.geekstar = new GeekStar(this, 180, -1842)
        this.sentinels.add( this.geekstar )

        this.controllersLaunched = false;
        this.takeoverStarted = false;
    }

    // Geek-star's HP has hit 0. Run the death cinematic — the player is torn
    // apart, the camera pans to the geek-star, it detonates into a shower of
    // pixels, then we hand off to the embedded meteor-smash bonus round.
    startGeekStarDeathSequence() {
        if (this.takeoverStarted)  return;
        this.takeoverStarted = true;

        // freeze the fight
        this.player.body.setVelocity(0, 0);
        this.enemyProjectiles.getChildren().slice().forEach( (p) => p.destroy() );

        // impact: camera shake + strobing background flash
        this.cameras.main.shake(700, 0.02);

        let flash = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0xffffff)
            .setDepth(90)
            .setAlpha(0)
            .setScrollFactor(0);

        this.tweens.add({
            targets: flash,
            alpha: { from: 0.85, to: 0 },
            duration: 130,
            repeat: 4,
            onComplete: () => flash.destroy()
        });

        // pan / zoom onto the geek-star as the moment turns
        this.time.delayedCall(500, () => this.showcaseGeekStar());

        // the player is torn apart
        this.time.delayedCall(1500, () => this.explodePlayer());

        // ...then the geek-star detonates into a shower of pixels
        this.time.delayedCall(3000, () => {
            if (this.geekstar && this.geekstar.active)  this.geekstar.destroy();
        });

        // white-out and hand off to the meteor-smash bonus round
        this.time.delayedCall(4400, () => {
            this.cameras.main.fadeOut(700, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.mountMeteorSmash();
            });
        });
    }

    explodePlayer() {
        this.explosionSound.play();
        this.cameras.main.shake(500, 0.03);

        new Explosion(this, this.player.x, this.player.y);

        // a million pieces
        let pieceConfig = {
            lifespan: { min: 800, max: 1800 },
            speed: { min: 40, max: 650 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.35, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 250,
            blendMode: 'ADD',
            emitting: false
        };

        let debrisBlue = this.add.particles(this.player.x, this.player.y, 'blue', pieceConfig);
        let debrisRed = this.add.particles(this.player.x, this.player.y, 'red', pieceConfig);
        debrisBlue.explode(600);
        debrisRed.explode(400);

        this.player.setVisible(false);
        this.player.body.enable = false;
    }

    showcaseGeekStar() {
        if (!this.geekstar || !this.geekstar.active)  return;

        this.cameras.main.pan(this.geekstar.x, this.geekstar.y, 1000, 'Sine.easeInOut');
        this.cameras.main.zoomTo(1.6, 1000, 'Sine.easeInOut');

        this.tweens.add({
            targets: this.geekstar,
            scale: { from: 1, to: 1.25 },
            duration: 350,
            yoyo: true,
            repeat: 2
        });
    }

    // Embed the meteor-smash prank as a full-screen iframe (rather than
    // redirecting the whole page). Same-origin in production
    // (easierbycode.com), so a postMessage handshake hands control back when
    // the 10-second bonus round ends.
    mountMeteorSmash() {
        let params = new URLSearchParams(window.location.search);
        // allow ?webpranks=http://localhost:5199 for local dev
        let base = (params.get('webpranks') || 'https://easierbycode.com/webpranks').replace(/\/$/, '');
        let target = encodeURIComponent('https://www.microcenter.com');
        let seconds = 10;

        let iframe = document.createElement('iframe');
        iframe.id = 'meteor-smash-frame';
        iframe.src = `${base}/meteor-smash/${target}/auto?t=${seconds}&embed=1`;
        iframe.allow = 'autoplay; fullscreen; gamepad';
        iframe.setAttribute('allowfullscreen', '');
        Object.assign(iframe.style, {
            position: 'fixed', inset: '0', width: '100vw', height: '100vh',
            border: '0', margin: '0', padding: '0', zIndex: '2147483647', background: '#000'
        });
        document.body.appendChild(iframe);
        this.meteorFrame = iframe;

        // listen for the bonus round to report back (with its score)
        this.onMeteorMessage = (event) => {
            let data = event && event.data;
            if (!data || data.source !== 'meteor-smash')  return;
            if (data.type === 'done')  this.endMeteorSmash(data.score || 0);
        };
        window.addEventListener('message', this.onMeteorMessage);

        // safety net: if the bonus never reports back (e.g. the fetch backend is
        // down) recover the game anyway.
        this.meteorSafety = window.setTimeout(() => this.endMeteorSmash(0), (seconds + 15) * 1000);

        // freeze the game underneath while the bonus round plays on top
        this.scene.pause();
    }

    endMeteorSmash(score) {
        if (!this.meteorFrame)  return;    // already handled

        window.clearTimeout(this.meteorSafety);
        window.removeEventListener('message', this.onMeteorMessage);
        this.meteorFrame.remove();
        this.meteorFrame = null;

        // resume the game and restore the view
        this.scene.resume();
        this.cameras.main.fadeIn(500, 255, 255, 255);
        this.cameras.main.pan(config.width / 2, config.height / 2, 600, 'Sine.easeInOut');
        this.cameras.main.zoomTo(1, 600, 'Sine.easeInOut');

        // respawn the player
        this.player.setVisible(true);
        this.player.body.enable = true;
        this.player.setPosition(config.width / 2, config.height - 64);
        this.player.alpha = 1;

        this.takeoverStarted = false;

        this.showBonusScore(score);
    }

    showBonusScore(score) {
        let label = this.add.text(config.width / 2, config.height / 2, `BONUS  +${score}`, {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '32px',
            color: '#ffe11a',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.tweens.add({
            targets: label,
            y: config.height / 2 - 80,
            alpha: { from: 1, to: 0 },
            duration: 2200,
            ease: 'Cubic.easeOut',
            onComplete: () => label.destroy()
        });
    }

    // loop which runs continuously
    update() {
        if (!this.takeoverStarted && this.player.alpha >= 0.3) {
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

        if (this.geekstar && this.geekstar.health > 0) {
            Phaser.Actions.RotateAroundDistance(this.group.getChildren(), this.geekstar, 0.1, 100);
        } else if (!this.takeoverStarted) {
            this.group.getChildren().forEach( (g) => {
                this.tweens.add({
                    targets: g,
                    alpha: 0,
                    duration: 250,
                    ease: 'Power2',
                    onComplete: () => {
                        g.destroy()
                    }
                })
            })

            if (!this.controllersLaunched) {
                this.controllersLaunched = true;

                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.sentinels.add( new PS5Controller(this, 43, -100) );
                        this.sentinels.add( new PS5Controller(this, 317, -100) );
                        this.sentinels.add( new HeadphoneInvader(this, (this.game.config.width / 2), -285))
                    },
                    callbackScope: this,
                    loop: false
                })
            }
        }
    }

}
