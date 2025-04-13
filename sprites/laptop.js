
export class Laptop extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'laptop' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );
        this.body.setVelocity(150, 100)

        this.health = 4;

        if (!scene.anims.get('laptop')) {
            scene.anims.create({
                key: 'laptop',
                frames: scene.anims.generateFrameNumbers('laptop', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            })
        }
        if (!scene.anims.get('laptop-hit')) {
            scene.anims.create({
                key: 'laptop-hit',
                frames: scene.anims.generateFrameNumbers('laptop', { start: 3, end: 2 }),
                frameRate: 12,
                repeat: 1
            })
        }

        this.play('laptop');

        return this;
    }

    damage( car, enemy ) {
        enemy.destroy();

        if (this.anims.getName() == 'laptop-hit')  return;
        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        if (this.health == 0)  this.body.setVelocity(0, 0);

        let anim = this.play('laptop-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.scene.explosionSound.play({ volume: 0.15 })

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
                    frame: [0, 1, 2, 3],
                    emitting: false
                };
                let boom = this.scene.add.particles(0, 0, 'laptop-particles', particleConfig);

                boom.explode( 100 );

                this.scene.time.delayedCall(500, () => {
                    boom.destroy()
                })

                this.destroy()
            } else {
                this.play('laptop')
            }
        })
    }

    destroy() {    
        super.destroy()
    }

    preUpdate(time, delta) {

        this.anims.update(time, delta);

        if (this.health == 0)  return;

        //bounce on the borders
        if (this.x < this.body.halfWidth) {
            this.x = this.body.halfWidth + 2;
            this.body.velocity.x *= -1;
        } else if (this.x > this.scene.game.config.width - this.body.halfWidth) {
            this.x = this.scene.game.config.width - this.body.halfWidth - 2;
            this.body.velocity.x *= -1;
        }

        // kill object at bottom
        if (this.body.top > this.scene.game.config.height) {
            this.destroy();
        }
    }
}