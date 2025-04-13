
export class CyberOctopus extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'cyber-octopus' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );

        this.setScale( 2 )

        this.currentVelocity = [0, 100]

        this.body.setVelocity(...this.currentVelocity)

        this.health = 3;

        if (!scene.anims.get('cyber-octopus')) {
            scene.anims.create({
                key: 'cyber-octopus',
                frames: scene.anims.generateFrameNumbers('cyber-octopus', { start: 0, end: 2 }),
                frameRate: 4,
                repeat: -1,
                yoyo: true
            })
        }
        if (!scene.anims.get('cyber-octopus-hit')) {
            scene.anims.create({
                key: 'cyber-octopus-hit',
                frames: scene.anims.generateFrameNumbers('cyber-octopus', { start: 3, end: 5 }),
                frameRate: 24,
                yoyo: true
            })
        }

        this.play('cyber-octopus');

        this.updatedBody = false;

        return this;
    }

    damage( geekstar, enemy ) {
        enemy.destroy();

        // can't take damage while getting hit or shooting
        if (this.anims.getName() != 'cyber-octopus')  return;

        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;

        if (this.health == 0)  this.body.setVelocity(0, 0);

        let anim = this.play('cyber-octopus-hit');

        anim.once('animationcomplete', () => {
            if (this.health == 0) {
                this.destroy()
            } else {
                this.play('cyber-octopus')
            }
        })
    }

    destroy() {
        // let particleConfig = {
        //     blendMode: Phaser.BlendModes.ADD,
        //     angle: {
        //         start: -180,
        //         end: 180,
        //         random: false,
        //         ease: 'Cubic.easeIn'
        //     },
        //     alpha: {
        //         start: 1,
        //         end: 0,
        //         ease: 'Cubic.easeIn',
        //     },
        //     lifespan: 600,
        //     gravityY: 1200,
        //     speedY: {
        //         min: -800,
        //         max: 800
        //     },
        //     speedX: {
        //         min: -800,
        //         max: 800
        //     },
        //     follow: this,
        //     frame: [0, 1, 2],
        //     scale: { start: 0.10, end: 0.025 },
        //     emitting: false
        // };
        // let boom = this.scene.add.particles(0, 0, 'cyber-octopus-particles', particleConfig);

        // boom.explode( 80 );

        // this.scene.time.delayedCall(600, () => {
        //     boom.destroy()
        // })
        super.destroy();
    }
}