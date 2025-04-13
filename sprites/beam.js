
export class Beam extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        let { x, y } = scene.player
        y -= 16
        super(scene, x, y, "beam")
        scene.add.existing(this)
        this.play("beam_anim")
        scene.physics.world.enableBody(this)
        this.body.velocity.y = -250
        scene.projectiles.add(this)
    }
  
    update() {
      if (this.y < 32) {
        this.destroy()
      }
    }

    destroy() {
      if (this.y >= 32) {
        let { x, y } = this
        new BeamImpact(this.scene, x, y)
      }
      super.destroy()
    }
  }


  export class BeamImpact extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "beam-impact")
        scene.add.existing(this)

        if (!scene.anims.get('beam-impact-anim')) {
          scene.anims.create({
              key: 'beam-impact-anim',
              frames: scene.anims.generateFrameNumbers('beam-impact'),
              frameRate: 16
          })
        }

        let anim = this.play("beam-impact-anim")

        anim.once('animationcomplete', () => {
          this.destroy()
        })
    }
  }