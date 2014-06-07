//Enemy class
Q.Sprite.extend("Enemy", {
    init: function(p, defaults){
        //this._super(p, {
        this._super(p,Q._defaults(defaults||{},{
            sheet: p.sprite,
            type: Q.SPRITE_ENEMY,
            frame: 1,
            //speed:300,
            vx: -100,
            health: 10,
            //ax: -100
            hasDeadAnim: false,
            damagePoints: 10,
            damageMp: 0, //damage for magic points
            collisionMask: Q.SPRITE_DEFAULT,
        }));
        this.add("2d, aiBounce, animation"); 
        this.on("bump.top",this,"die");
        this.on("hit.sprite",this,"hit"); 
        this.on("bullet.hit", this, "hitByBullet");  
    },
    __getDirection: function(){
        if(this.p.vx < 0){
            return "left";
        }else{
            return "right";
        }
    },
    hit: function(col) {
        if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
            col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
           // console.log(col.obj.p.cx +", " + this.p.cx);
        }
        return;
    },
    hitByBullet: function(data){        
        var bullet = data.bulletObj;
        if(this.p.health > 0){
            this.p.health -= bullet.p.damageVal;
        }
        console.log(this.p.health);
        if (this.p.health <= 0) {
            var dir = this.__getDirection();
            console.log(dir);
            if(this.p.hasDeadAnim){
               this.play('enemy_dead_' + dir); 
            }
            this.destroy();
        }
        //this.destroy(); 
    },
    die: function(col) {
        if(col.obj.isA("Player")) {
            this.p.vx=this.p.vy=0;
            //TODO: enemy dead anim

            this.p.dead = true;
            var that = this;
            col.obj.p.vy = -300;
            this.p.deadTimer = 0;
        }
    },
    step: function(dt) {   
        //tile boundary detection
        if(this.p.x - (this.p.w)/2< (this.p.leftBound) * 64){
           this.p.x = (this.p.leftBound) * 64 + (this.p.w)/2;
           this.p.vx = -this.p.vx;
           this.play("enemy_walk_right");
        }else if(this.p.x + (this.p.w)/2 > (this.p.rightBound + 1) * 64){
            this.p.x = (this.p.rightBound + 1) * 64 - (this.p.w)/2;
            this.p.vx = -this.p.vx;
            this.play("enemy_walk_left");
        }else if(this.p.dead) {
            this.del('2d, aiBounce');
            this.p.deadTimer++;
            if (this.p.deadTimer > 24) {
            // Dead for 24 frames, remove it.
                this.destroy();
            }
            return;
        }else if(this.p.vx < 0){
          this.play('enemy_walk_left');  
        }else{
          this.play("enemy_walk_right");
        }
        
    },
});//End of Enemy
Q.Enemy.extend("Ghost", {
    init: function(p){
        this._super(p, {       
            sheet: "ghost_25_35",
            sprite: "ghost_25_35",
            damageMp: 10,
        });
    }
});
Q.Enemy.extend("Ghost_red", {
    init: function(p){
        this._super(p, {       
            sheet: "ghost_red_25_35",
            sprite: "ghost_red_25_35",
        });
    }
});
Q.Enemy.extend("Skeleton", {
    init: function(p){
        this._super(p, {       
            sheet: "skeleton_36_48",
            sprite: "skeleton_36_48",
            scale:2,
            speed: 800,
            damagePoints:30,
            health: 50,
            hasDeadAnim: true,
            //points: [[-1/2, 0], [-1/2, 1], [1/2, 1], [1/2, 0]],
            points: [[-9, -24], [-9, 24], [9, 24], [9, -24]],
        });
        //this.size(false);
    }
});