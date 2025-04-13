
import { Explosion } from './explosion.js'
import { Human } from './human.js'


export class GeekCar extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        
        super( scene, x, y, 'geek-car' );
        
        this.scene = scene;
        
        scene.add.existing( this );
        scene.physics.world.enableBody( this );
        this.body.velocity.x = 50;

        this.health = 10;

        return this;
    }

    damage( car, enemy ) {
        enemy.destroy();
        let damagePoints = enemy.damagePoints || 1;
        this.health -= damagePoints;
        if ( this.health == 0 ) {

            this.emit( 'emit_death' );

            this.body.velocity.x = 0;
            
            let {x, y} = this.getTopLeft();
            x += 61;
            y += 28;
            new Human( this.scene, x, y );

            this.destroy()
                
        } else {
            // this.scene.juice.flash( this );
        }
    }

    destroy() {
        if (this.body.left < this.scene.game.config.width) {
            new Explosion(this.scene, this.getBottomLeft().x + 16, this.y)
            new Explosion(this.scene, this.getBottomCenter().x, this.y)
            new Explosion(this.scene, this.getRightCenter().x - 16, this.y)
            this.scene.explosionSound.play({ volume: 0.4 })
        }
        super.destroy()
    }

    preUpdate(time, delta) {

        if (this.health == 0)  return;

        // kill object beyond right edge
        if (this.body.left > this.scene.game.config.width) {
            this.destroy();
        }
    }
}