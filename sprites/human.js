
const MAXSPEED = 100

export class Human extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "rudy")

    scene.add.existing(this)
    scene.physics.world.enableBody(this)
    this.setScale(2)
    this.body.velocity.x = 0 //-MAXSPEED
    this.body.velocity.y = MAXSPEED

    // this.on("animationupdate", (animation, frame, gameObject) => {
    //   this.body.velocity.x = this.getVelocity(frame.textureFrame)
    //   //  squish and rotate for illusion of 'banking'
    //   let bank = this.body.velocity.x / MAXSPEED
    //   gameObject.setScale(2 - Math.abs(bank) / 5)
    //   this.angle = 0 - bank * 20
    // })

    scene.physics.add.overlap(this, this.scene.player, (h, p) => {
        h.destroy( h, p );
    })
    
    this.play("parachute")
  }

  getVelocity(frame) {
    switch (frame) {
      case 0:
        return -MAXSPEED
      case 1:
        return 0
      case 2:
        return MAXSPEED
      case 3:
        return 0
      default:
        return 0
    }
  }

    destroy() {
        this.scene.savedSound.play()
        super.destroy()
    }
}