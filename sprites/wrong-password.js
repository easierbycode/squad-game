
export class WrongPassword extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'wrong-password' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );
        this.body.setVelocity(100, 50)

        this.setScale( 2 );

        this.health = 4;

        if (!scene.anims.get('wrong-password')) {
            
            let frames = scene.anims.generateFrameNumbers('wrong-password', { start: 3, end: 10 }).map( (frame) => {
                frame.duration = 250;
                return frame;
            })

            scene.anims.create({
                key: 'wrong-password',
                frames: [
                    { key: 'wrong-password', frame: 2, duration: 500 },
                    ...frames,
                    { key: 'wrong-password', frame: 11, duration: 500 }
                ],
                repeat: -1
            })
        }
        if (!scene.anims.get('wrong-password-hit')) {
            scene.anims.create({
                key: 'wrong-password-hit',
                frames: scene.anims.generateFrameNumbers('wrong-password', { start: 0, end: 1 }),
                frameRate: 12,
                repeat: 1
            })
        }

        this.play('wrong-password');

        // wrong-password is 30x22

        let particleConfig = {
            speed: 125,
            lifespan: {
              onEmit: (particle, key, t, value) => {
                return Phaser.Math.Between(200, 300)
              }
            },
            angle: {
              onEmit: (particle, key, t, value) => {
                var v = Phaser.Math.Between(-15, 15)
                return this.angle - 90 + v
              }
            },
            scale: { start: 1, end: 0 },
            blendMode: "ADD",
            frame: [0, 1, 2],
            emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-6, 0, 12, 1) },
            follow: this
        }
    
        this.emitter = scene.add.particles(0, -22, 'ms-logo-particles', particleConfig);
    
        this.nextShotAt = 0
        this.scene = scene

        return this;
    }

    damage( car, enemy ) {
        enemy.destroy();

        if (this.anims.getName() == 'wrong-password-hit')  return;
        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        if (this.health == 0)  this.body.setVelocity(0, 0);

        let anim = this.play('wrong-password-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.destroy()
            } else {
                this.play('wrong-password')
            }
        })
    }

    destroy() {

        this.emitter.destroy();

        if (this.body.top < this.scene.game.config.height) {
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
                frame: [0, 1, 2],
                emitting: false
            };
            let boom = this.scene.add.particles(0, 0, 'password-wrong-particles', particleConfig);

            this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    boom.destroy();
                }
            })
            boom.explode( 100 );

        }
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