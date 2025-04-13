

import { GeekBullet } from "./geek-bullet.js";


export class HeadphoneInvader extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'headphone-invader' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );

        this.currentVelocity = [0, 100]

        this.body.setVelocity(...this.currentVelocity)

        this.health = 20;

        if (!scene.anims.get('headphone-invader')) {
            scene.anims.create({
                key: 'headphone-invader',
                frames: scene.anims.generateFrameNumbers('headphone-invader', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            })
        }
        if (!scene.anims.get('headphone-invader-hit')) {
            scene.anims.create({
                key: 'headphone-invader-hit',
                frames: [
                    {key: 'headphone-invader', frame: 2},
                    {key: 'headphone-invader', frame: 3},
                    {key: 'headphone-invader', frame: 4},
                    {key: 'headphone-invader', frame: 5}
                ],
                frameRate: 12
            })
        }

        this.play('headphone-invader');

        this.updatedBody = false;

        return this;
    }

    scheduleShooting() {

        // if (this.health == 0)  return;

        // this.currentVelocity = [this.body.velocity.x, this.body.velocity.y];

        // this.body.setVelocity(0, 0);

        // let anim = this.play('geekstar-shoot');

        // anim.once('animationcomplete', () => {
        //     this.scene.enemyProjectiles.add( new GeekBullet(this.scene) );

        //     let animComplete = this.play('geekstar-shoot-complete');

        //     animComplete.once('animationcomplete', () => {
        //         this.play('geekstar');

        //         this.body.setVelocity(...this.currentVelocity);
        //     })
        // })

        // this.scene.time.addEvent(this.enemyTimer);
    }

    damage( geekstar, enemy ) {
        enemy.destroy();

        // can't take damage while getting hit or shooting
        if (this.anims.getName() != 'headphone-invader')  return;

        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        if (this.health == 0)  this.body.setVelocity(0, 0);

        let anim = this.play('headphone-invader-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.destroy()
            } else {
                this.play('headphone-invader')
            }
        })
    }

    preUpdate(time, delta) {
        if (this.updatedBody == false && this.y > 143) {

            this.body.setCollideWorldBounds(true);
            this.body.setVelocity(-50, 0);
            // this.body.setVelocity(0, 0);
            this.body.setBounce(1);

            // this.scene.time.addEvent(this.enemyTimer);

            this.updatedBody = true;
        }

        this.anims.update(time, delta);
    }

    destroy() {
        let particleConfig = {
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
            lifespan: 600,
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
            frame: [0, 1, 2],
            scale: { start: 0.10, end: 0.025 },
            emitting: false
        };
        let boom = this.scene.add.particles(0, 0, 'headphone-invader-particles', particleConfig);

        boom.explode( 80 );

        this.scene.time.delayedCall(600, () => {
            boom.destroy()
        })
        super.destroy();
    }
}