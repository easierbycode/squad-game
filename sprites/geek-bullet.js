
export class GeekBullet extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        let { x, y } = scene.geekstar
        x += 4
        y -= 23
        super(scene, x, y, "geek-bullet")
        scene.add.existing(this)
        scene.physics.world.enableBody(this)

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
            scale: { start: 0.175, end: 0 },
            blendMode: "ADD",
            follow: this
        }
    
        this.emitter = scene.add.particles(0, 5, 'red', particleConfig);

        this.body.velocity.y = 250

        return this
    }
  
    update() {
        // kill object at bottom
        if (this.body.top > (this.scene.game.config.height + 100)) {
            this.destroy();
        }
    }

    destroy() {
        this.emitter.destroy()
        super.destroy()
    }
  }