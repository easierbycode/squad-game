

export class PS5Bullet extends Phaser.GameObjects.Sprite {
    constructor(gameObject) {
        let { x, y, scene } = gameObject
        // x += 4
        // y -= 23
        super(scene, x, y, "ps5-bullet")
        scene.add.existing(this)
        scene.physics.world.enableBody(this)

        // (1000 / 60) * 12 = 200

        if (!scene.anims.get('ps5-bullet-1')) {
            scene.anims.create({
                key: 'ps5-bullet-1',
                // frames: scene.anims.generateFrameNumbers('ps5-bullet', { start: 0, end: 1 }),
                frames: [ {key: 'ps5-bullet', frame: 0, duration: 120}, {key: 'ps5-bullet', frame: 1, duration: 15} ],
                // frameRate: 12,
                repeat: -1
            })
        }
        if (!scene.anims.get('ps5-bullet-2')) {
            scene.anims.create({
                key: 'ps5-bullet-2',
                frames: [ {key: 'ps5-bullet', frame: 2, duration: 120}, {key: 'ps5-bullet', frame: 3, duration: 15} ],
                frameRate: 12,
                repeat: -1
            })
        }
        if (!scene.anims.get('ps5-bullet-3')) {
            scene.anims.create({
                key: 'ps5-bullet-3',
                frames: [ {key: 'ps5-bullet', frame: 4, duration: 120}, {key: 'ps5-bullet', frame: 5, duration: 15} ],
                frameRate: 12,
                repeat: -1
            })
        }
        if (!scene.anims.get('ps5-bullet-4')) {
            scene.anims.create({
                key: 'ps5-bullet-4',
                frames: [ {key: 'ps5-bullet', frame: 6, duration: 120}, {key: 'ps5-bullet', frame: 7, duration: 15} ],
                frameRate: 12,
                repeat: -1
            })
        }

        let anim = Phaser.Math.RND.pick(['ps5-bullet-1', 'ps5-bullet-2', 'ps5-bullet-3', 'ps5-bullet-4'])

        this.play( anim );

        // let particleConfig = {
        //     speed: 125,
        //     lifespan: {
        //       onEmit: (particle, key, t, value) => {
        //         return Phaser.Math.Between(200, 300)
        //       }
        //     },
        //     angle: {
        //       onEmit: (particle, key, t, value) => {
        //         var v = Phaser.Math.Between(-15, 15)
        //         return this.angle - 90 + v
        //       }
        //     },
        //     scale: { start: 0.175, end: 0 },
        //     blendMode: "ADD",
        //     follow: this
        // }
    
        // this.emitter = scene.add.particles(0, 5, 'red', particleConfig);

        // this.body.velocity.y = 250

        // let angle = Phaser.Math.Angle.BetweenPoints(this, scene.player)

        // this.setAngle(Phaser.Math.RadToDeg(angle) + 90)

        // calculate angle to player
        let angle = Phaser.Math.Angle.BetweenPoints(this, scene.player)

        // rotate bullet to face player
        this.setAngle(Phaser.Math.RadToDeg(angle) + 90)

        // calculate velocity from angle
        let velocity = scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), 850)

        // set velocity
        this.body.velocity.x = velocity.x
        this.body.velocity.y = velocity.y

        return this
    }
  
    update() {
        // kill object at bottom
        if (this.body.top > (this.scene.game.config.height + 100)) {
            this.destroy();
        }
    }

    destroy() {
        // this.emitter.destroy()
        super.destroy()
    }
  }