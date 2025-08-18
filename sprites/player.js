
import { Beam } from "./beam.js"
import { Explosion } from "./explosion.js"
import { config } from "../js/config.js"


const gameSettings = {
    playerSpeed: 200
}


export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    // super( scene, x, y, 'ship-boy' );
    super( scene, x, y, 'bby-ship' );
    scene.physics.world.enableBody(this)

    this.beamSound = scene.sound.add("audio_beam", { volume: 0.1 })
    this.pickupSound = scene.sound.add("audio_pickup")

    this.cursorKeys = scene.input.keyboard.createCursorKeys()

    // var particles = scene.add.particles("blue")

    // this.emitter = particles.createEmitter({
    //   speed: 125,
    //   lifespan: {
    //     onEmit: (particle, key, t, value) => {
    //       return Phaser.Math.Between(200, 300)
    //     }
    //   },
    //   angle: {
    //     onEmit: (particle, key, t, value) => {
    //       var v = Phaser.Math.Between(-15, 15)
    //       return this.angle - 270 + v
    //     }
    //   },
    //   scale: { start: 0.275, end: 0 },
    //   blendMode: "ADD"
    // })
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
            return this.angle - 270 + v
          }
        },
        scale: { start: 0.275, end: 0 },
        blendMode: "ADD",
        follow: this
    }

    scene.add.particles(0, 35, 'blue', particleConfig);

    this.boosting = false
    this.nextShotAt = 0
    this.scene = scene

    this.body.setCollideWorldBounds(true)
    this.setScale( 2 );
    // this.emitter.startFollow(this)

    // scene.anims.create({
    //   key: "ship-boy-death",
    //   frames: [
    //     { key: "ship-boy", frame: 1 },
    //     { key: "ship-boy", frame: 2 },
    //     { key: "ship-boy", frame: 3 },
    //     { key: "ship-boy", frame: 4 },
    //     { key: "ship-boy", frame: 5 },
    //     { key: "ship-boy", frame: 6 },
    //     { key: "ship-boy", frame: 7 },
    //     { key: "ship-boy", frame: 8 },
    //     { key: "ship-boy", frame: 9 },
    //     { key: "ship-boy", frame: 10 },
    //     { key: "ship-boy", frame: 11 },
    //     { key: "ship-boy", frame: 12 },
    //     { key: "ship-boy", frame: 13 }
    //   ],
    //   duration: 1000,
    //   repeat: 0
    // })

    // scene.anims.create({
    //   key: "ship-boy-powerup",
    //   frames: [
    //     { key: "ship-boy", frame: 15 },
    //     { key: "ship-boy", frame: 14 },
    //     { key: "ship-boy", frame: 15 },
    //     { key: "ship-boy", frame: 14 }
    //   ],
    //   frameRate: 4,
    //   repeat: 0
    // })

    scene.add.existing(this)
  }

  boost() {
    // restart if already boosting
    if (
      this.scene.juice.spinXTween &&
      this.scene.juice.spinXTween.isPlaying()
    ) {
      return this.scene.juice.spinXTween.restart()
    }

    this.scene.music.setRate(1.5)
    this.boosting = true
    this.scene.stars.setSpeedY(425)
    this.scene.stars.frequency = 50

    this.emitter.setSpeed(375)

    this.scene.juice.spinX(this, true, {
      duration: 250,
      repeat: 16,
      onComplete: () => {
        this.scene.music.setRate(1)

        this.scene.stars.setSpeedY({
          min: 60,
          max: 100
        })
        this.scene.stars.frequency = 100

        this.emitter.setSpeed(125)

        this.boosting = false
      }
    })
  }

  damage(player, enemy) {
    if (this.alpha < 1) return

    // invincible while boosting
    if (this.boosting) {
      this.scene.hitEnemy(null, enemy)
    } else {
      this.scene.resetShipPos(enemy)

      this.emitter.setVisible(false)

      this.alpha = 0.25

      navigator.vibrate(Infinity)

      var explosion = new Explosion(this.scene, player.x, player.y)

    //   this.play( 'ship-boy-death' );
    //   this.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
      explosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
        this.setVisible(false)
        navigator.vibrate(0)
        this.resetPlayer()
      })
    }
  }

  resetPlayer() {
    var x = config.width / 2 - 8
    var y = config.height + 64

    this.x = x
    this.y = y
    // this.setFrame( 0 );
    this.setVisible(true)

    var tween = this.scene.tweens.add({
      targets: this,
      y: config.height - 64,
      ease: "Power1",
      duration: 1500,
      repeat: 0,
      alpha: 1,
      onComplete: function() {
        // this.alpha = 1;
        this.emitter.setVisible(true)
      },
      callbackScope: this
    })
  }

  shoot() {
    if (this.nextShotAt > this.scene.game.getTime()) return
    var beam = new Beam(this.scene)
    this.beamSound.play()
    this.nextShotAt = this.scene.game.getTime() + 100
  }

  movePlayerManager() {
    this.body.setVelocity(0)

    if (this.scene.input.activePointer.isDown) {
      this.x = this.scene.input.activePointer.x
      // slighthly above finger position
      this.y = this.scene.input.activePointer.y - 15

      return
    }

    if (this.cursorKeys.left.isDown) {
      this.body.setVelocityX(-gameSettings.playerSpeed)
    } else if (this.cursorKeys.right.isDown) {
      this.body.setVelocityX(gameSettings.playerSpeed)
    }

    if (this.cursorKeys.up.isDown) {
      this.body.setVelocityY(-gameSettings.playerSpeed)
    } else if (this.cursorKeys.down.isDown) {
      this.body.setVelocityY(gameSettings.playerSpeed)
    }
  }

  pickPowerUp(player, powerUp) {
    if (this.alpha < 1 || this.active == false) return
    powerUp.disableBody(true, true)
    this.pickupSound.play()
    this.boost()
    // this.play( 'ship-boy-powerup' );
    // this.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
    //     this.setFrame( 0 );
    // });
  }

}
