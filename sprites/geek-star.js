
import { GeekBullet } from "./geek-bullet.js";


export class GeekStar extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'geekstar' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );

        // this.body.setCircle( 17, 72, 4 );

        this.currentVelocity = [0, 100]

        this.body.setVelocity(...this.currentVelocity)

        this.health = 15;

        if (!scene.anims.get('geekstar')) {
            scene.anims.create({
                key: 'geekstar',
                frames: scene.anims.generateFrameNumbers('geekstar', { start: 0, end: 1 }),
                frameRate: 1,
                repeat: -1
            })
        }
        if (!scene.anims.get('geekstar-hit')) {
            scene.anims.create({
                key: 'geekstar-hit',
                frames: [
                    {key: 'geekstar', frame: 0},
                    {key: 'geekstar', frame: 5},
                    {key: 'geekstar', frame: 4}
                ],
                frameRate: 12,
                yoyo: true
            })
        }
        if (!scene.anims.get('geekstar-shoot')) {
            scene.anims.create({
                key: 'geekstar-shoot',
                frames: [
                    {key: 'geekstar', frame: 0, duration: 50},
                    {key: 'geekstar', frame: 5, duration: 50},
                    {key: 'geekstar', frame: 4, duration: 100},
                    {key: 'geekstar', frame: 3, duration: 10}
                ]
            })
        }
        if (!scene.anims.get('geekstar-shoot-complete')) {
            scene.anims.create({
                key: 'geekstar-shoot-complete',
                frames: [
                    {key: 'geekstar', frame: 3, duration: 300},
                    {key: 'geekstar', frame: 4, duration: 100},
                    {key: 'geekstar', frame: 5, duration: 100},
                    {key: 'geekstar', frame: 0, duration: 100}
                ]
            })
        }

        this.play('geekstar');

        this.updatedBody = false;

        this.enemyTimer = new Phaser.Time.TimerEvent({
            delay: 2000,
            callback: this.scheduleShooting,
            callbackScope: this
        });

        return this;
    }

    scheduleShooting() {

        if (this.health == 0)  return;

        this.currentVelocity = [this.body.velocity.x, this.body.velocity.y];

        this.body.setVelocity(0, 0);

        let anim = this.play('geekstar-shoot');

        anim.once('animationcomplete', () => {
            this.scene.enemyProjectiles.add( new GeekBullet(this.scene) );

            let animComplete = this.play('geekstar-shoot-complete');

            animComplete.once('animationcomplete', () => {
                this.play('geekstar');

                this.body.setVelocity(...this.currentVelocity);
            })
        })

        this.scene.time.addEvent(this.enemyTimer);
    }

    damage( geekstar, enemy ) {
        enemy.destroy();

        // can't take damage while getting hit or shooting
        if (this.anims.getName() != 'geekstar')  return;

        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        if (this.health == 0)  this.body.setVelocity(0, 0);

        let anim = this.play('geekstar-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.destroy()
            } else {
                this.play('geekstar')
            }
        })
    }

    preUpdate(time, delta) {
        if (this.updatedBody == false && this.y > 82) {

            for (var i = 0; i < 12; i++)
            {
                this.scene.group.create(i*15 + 100, 0, 'geek-ellipsis', 0);
            }

            this.body.setCollideWorldBounds(true);
            this.body.setVelocity(-50, 0);
            this.body.setBounce(1);

            this.scene.time.addEvent(this.enemyTimer);

            this.updatedBody = true;
        }

        this.anims.update(time, delta);
    }

    destroy() {
        // let lifespan = Phaser.Math.Between(250, 500);
        let lifespan = Phaser.Math.Between(1000, 1250);
        let particleConfig = {
            alpha: {
                start: 1,
                end: 0,
                ease: 'Cubic.easeIn',
            },
            lifespan,
            gravityY: 200,
            speedY: {
                min: -400,
                max: 400
            },
            speedX: {
                min: -400,
                max: 400
            },
            follow: this,
            maxParticles: 1
        };
        let e1 = this.scene.add.particles(-36, 23, 'squad-s', particleConfig);
        let e2 = this.scene.add.particles(-18, 23, 'squad-q', particleConfig);
        let e3 = this.scene.add.particles(0, 23, 'squad-u', particleConfig);
        let e4 = this.scene.add.particles(18, 23, 'squad-a', particleConfig);
        let e5 = this.scene.add.particles(35, 23, 'squad-d', particleConfig);

        let e6 = this.scene.add.particles(-47, -13, 'geek-g', particleConfig);
        let e7 = this.scene.add.particles(-12, -13, 'geek-e', particleConfig);
        let e8 = this.scene.add.particles(20, -13, 'geek-e', particleConfig);
        let e9 = this.scene.add.particles(49, -13, 'geek-k', particleConfig);

        particleConfig.lifespan = 2000;
        particleConfig.speedY = {
            min: 100,
            max: 400
        }
        particleConfig.scale = { start: 1, end: 11 }

        let e10 = this.scene.add.particles(4, -31, 'geekstar-dead', particleConfig);

        let particleConfig2 = {
            blendMode: Phaser.BlendModes.ADD,
            angle: {
                start: -180,
                end: 180,
                random: false,
                ease: 'Cubic.easeIn'
            },
            alpha: {
                start: 1,
                end: 0,
                ease: 'Cubic.easeIn',
            },
            lifespan: 500,
            gravityY: 1200,
            speedY: {
                min: -800,
                max: 800
            },
            speedX: {
                min: -800,
                max: 800
            },
            follow: this,
            emitZone: { type: 'edge', source: new Phaser.Geom.Ellipse(0, 0, 170, 105) },
            emitting: false
        };

        let boom = this.scene.add.particles(0, 0, 'geekstar-grey', particleConfig2);
        boom.explode( 100 );

        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                e1.destroy();
                e2.destroy();
                e3.destroy();
                e4.destroy();
                e5.destroy();
                e6.destroy();
                e7.destroy();
                e8.destroy();
                e9.destroy();
                e10.destroy();
                boom.destroy();
            }
        })

        super.destroy();
    }
}