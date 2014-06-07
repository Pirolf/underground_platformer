Q.Sprite.extend("Bullet", {
    init: function(p){
        this._super(p, {
            sheet: "explosions",
            sprite: "explosions",           
            type: Q.SPRITE_BULLET,
            collisionMask: Q.SPRITE_ENEMY,
            intervalInMS: 2500, //max life of a bullet
            intervalTimer: 0,
            hitTimer: 0,
            damageVal: 10,
            hasHit: false,
            vx: 500,
            vy: 0,
            scale: 2/3,
            gravity: 0,
            shot: true,
            useMp: 20,
            //points: [[-1/2, 0], [-1/2, 1], [1/2, 1], [1/2, 0]],
            points: [[-3, -3], [-3, 3], [3, 3], [3, -3]],
        });
        this.add("2d, animation");
        this.on("hit.sprite",this,"hitEnemy"); 
        this.on("hit.tile", this, "hitEnemy");
    },
    hitEnemy: function(col){
        var colObj = col.obj;
        if(colObj.p.type === Q.SPRITE_ENEMY) {
            colObj.trigger('bullet.hit', {"bulletObj":this});
            console.log("bullet.hit triggered");
        }
        this.p.hasHit = true;
    },
    step: function(delta){
        if(!this.p.hasHit){
             if( this.p.intervalTimer < (this.p.intervalInMS*12)/1000.0){
                this.p.intervalTimer++;
                this.play("bullet_shoot");
             }else{
                this.destroy();
             }
        }else if(this.p.hasHit){
            this.p.hitTimer++;
            if(this.p.hitTimer >= 8){
                this.destroy();
            }else{
                this.play("bullet_hit");
            }
        }     
    },
});
Q.Bullet.CONSUME_MP = 30;