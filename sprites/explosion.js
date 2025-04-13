
export class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, "explosion")
  
      this.setScale(2)
  
      scene.add.existing(this)
      this.play("explode")
    }
  }