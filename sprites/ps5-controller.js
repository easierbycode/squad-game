

import { PS5Bullet } from "./ps5-bullet.js";


export class PS5Controller extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'ps5-controller' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );

        this.setScale( 3 );

        // this.body.setCircle( 17, 72, 4 );

        this.currentVelocity = [0, 100]

        this.body.setVelocity(...this.currentVelocity)

        this.health = 20;

        if (!scene.anims.get('ps5-controller')) {
            scene.anims.create({
                key: 'ps5-controller',
                frames: scene.anims.generateFrameNumbers('ps5-controller', { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1
            })
        }
        if (!scene.anims.get('ps5-controller-hit')) {
            scene.anims.create({
                key: 'ps5-controller-hit',
                frames: scene.anims.generateFrameNumbers('ps5-controller', { start: 0, end: 1 }),
                frameRate: 20,
                repeat: 3
            })
        }

        this.play('ps5-controller');

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

        this.scene.enemyProjectiles.add( new PS5Bullet(this) );
        
        console.log(this.scene.children.length)

        this.scene.time.addEvent(this.enemyTimer);
    }

    damage( geekstar, enemy ) {
        enemy.destroy();

        // can't take damage while getting hit or shooting
        if (this.anims.getName() != 'ps5-controller')  return;

        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        let anim = this.play('ps5-controller-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.destroy()
            } else {
                this.play('ps5-controller')
            }
        })
    }

    preUpdate(time, delta) {
        // if (this.updatedBody == false && this.y > 82) {
        if (this.updatedBody == false && this.y > 276) {

            this.body.setCollideWorldBounds(true);
            
            if (this.x > (this.scene.game.config.width / 2)) {
                this.body.setVelocity(50, 0);
            } else {
                this.body.setVelocity(-50, 0);
            }

            this.body.setBounce(1);

            this.scene.time.addEvent(this.enemyTimer);

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
            emitting: false
        };
        let boom = this.scene.add.particles(0, 0, 'ps5-controller-particles', particleConfig);

        boom.explode( 100 );

        this.scene.time.delayedCall(600, () => {
            boom.destroy()
        })

        super.destroy();
    }
}