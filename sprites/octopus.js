
export class Octopus extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'octopus' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );
        this.body.velocity.y = 50;

        this.health = 2;

        this.setScale( 2 );

        this.play('octopus');

        this.on("animationupdate", (animation, frame, gameObject) => {
            if (this.health == 0) return;
            if (frame.textureFrame == 0)  this.body.velocity.y = 150;
            if (frame.textureFrame == 1)  this.body.velocity.y = -25;
        })

        return this;
    }

    damage( car, enemy ) {
        enemy.destroy();
        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;
        if ( this.health == 0 ) {

            this.emit( 'emit_death' );

            this.body.velocity.y = 0;

            this.destroy()
        } else {
            // this.scene.juice.flash( this );
        }
    }

    destroy() {    
        if (this.body.top < this.scene.game.config.height) {
            let lifespan = Phaser.Math.Between(250, 500);
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
                maxParticles: 1,
                scale: 2
            };
            let emit1 = this.scene.add.particles(0, 0, 'octopus-particles-0', particleConfig);
            let emit2 = this.scene.add.particles(0, 0, 'octopus-particles-1', particleConfig);

            this.scene.time.addEvent({
                delay: lifespan,
                callback: () => {
                    emit1.destroy();
                    emit2.destroy();
                }
            })

            this.scene.explosionSound.play({ volume: 0.15 })
        }
        super.destroy()
    }

    preUpdate(time, delta) {

        this.anims.update(time, delta);

        if (this.health == 0)  return;

        // kill object at bottom
        if (this.body.top > this.scene.game.config.height) {
            this.destroy();
        }
    }
}