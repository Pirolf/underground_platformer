//Enemy class
Q.Sprite.extend("Enemy", {
    init: function(p, defaults){
        this._super(p,Q._defaults(defaults||{},{
            sheet: p.sprite,
            type: Q.SPRITE_ENEMY,
            frame: 1,
            speed:300,
            accelerateSeeingPlayer: false,
            speedLimit: 500,
            speedMin: 1, //by default speedMin == original speed, here it's one just to avoid > max
            vx: -100,
            health: 10,
            //ax: -100
            hasDeadAnim: false,
            damagePoints: 10,
            damageMp: 0, //damage for magic points
            dropCollId: -1,
            death_opacity: 0,
            dead:false,
            collisionMask: Q.SPRITE_DEFAULT,
            DEAD_TIME: 2000,
            health: 20,
            expPoints: 0,
        }));
        this.add("2d, aiBounce, animation, tween"); 
        this.on("bump.top",this,"die");
        this.on("hit.sprite",this,"hit"); 
        this.on("bullet.hit", this, "hitByBullet"); 

       
    },
    __assignDroppable: function(){
        if(this.p.dropProccessed){
            return;
        }
        this.p.dropProccessed = true;
        var inserted = false;
        var ran = Math.floor(Math.random() * currTotalWeight);
        console.log("ran :" + ran);
        for(var key in Q.collClass){
            currClassName = (Q.collClass)[key]["name"];
            lo = (Q.collClass)[key]["range"][0];
            hi = (Q.collClass)[key]["range"][1];
            console.log(currClassName + ": lo: "+lo + ", hi: " + hi);
            if(lo <= ran && ran < hi){
                this.p.dropObj = currClassName;
                if(!inserted){
                    inserted = true;
                }
                return;
            }
        }
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
            col.obj.trigger('enemy.hit', {"enemy":this,"colObj":col.obj});
           // console.log(col.obj.p.cx +", " + this.p.cx);
        }
        return;
    },
    hitByBullet: function(data){        
        var bullet = data.bulletObj;
        var player = Q("Player").first();
        if(this.p.health > 0){
            this.p.health -= bullet.p.damageVal;
            if(player.p.weapon){
                this.p.health -= (player.p.weapon).p.offset_fireDamage;
            }
            console.log("enemy health: " + this.p.health);
        }
        if (this.p.health <= 0) {
            this.die(bullet);
        }
    },
    die: function(col) {
        player = Q("Player").first();
        player.p.score += this.p.expPoints;
        Q.stageScene('hud', 2, player.p);

        if(col.className && col.isA("Bullet")){
            this.p.vx=this.p.vy=0;
            this.p.dead = true;
            this.p.deadTimer = 0;
            this.__assignDroppable();

        } else if(col.obj.isA("Player")) {
            this.p.vx=this.p.vy=0;
            this.p.dead = true;
            col.obj.p.vy = -300;
            this.p.deadTimer = 0;
            this.__assignDroppable();
        }
    },
    step: function(delta) {   
        if((!this.p.itemDropped) && this.p.dropObj){
            this.p.itemDropped = true;
            this.p.attachedDroppable = new Q[currClassName]({         
                x: this.p.x,
                y: Q('Player').first().p.y- 64,
                spawnTimer:  0,
                inserting: true, 
            });
        }else if(this.p.itemDropped && (!this.p.dropping)){
            var ad = this.p.attachedDroppable;
            ad.p.spawnTimer ++;
            if(ad.p.spawnTimer >= this.p.DEAD_TIME * 48/1000.0){
               this.p.dropping = true;
               Q.stage().insert(ad);
            }    
        }
        
        //tile boundary detection
        if(this.p.x - (this.p.w)/2 < (this.p.leftBound) * 64){
           this.p.x = (this.p.leftBound) * 64 + (this.p.w)/2;
           this.p.vx = -this.p.vx;
           if(!this.p.asset) {
                this.play("enemy_walk_right");
            }
        }else if(this.p.x + (this.p.w)/2 >= (this.p.rightBound + 1) * 64){
            this.p.x = (this.p.rightBound + 1) * 64 - (this.p.w)/2;
            this.p.vx = -this.p.vx;
            if(!this.p.asset) {
                this.play("enemy_walk_left");
            }
        }else if(this.p.dead) {
            this.del('2d, aiBounce');
            var dir = this.__getDirection();
            this.p.deadTimer++;
            if(this.p.hasDeadAnim){
               this.play('enemy_dead_' + dir); 
               if (this.p.deadTimer > this.p.DEAD_TIME * 48/1000){
                    this.destroy();
                }
            }else{
                if (this.p.deadTimer > this.p.DEAD_TIME * 48/1000) {
                    this.destroy();
                }else{
                  this.animate({"opacity": this.p.death_opacity}, 0);  
                }        
            }     
            return;
        }

        if(this.p.vx < 0){         
          if(!this.p.asset){
            this.play('enemy_walk_left');
            if(this.p.ax !== 0 && this.p.accelerateSeeingPlayer ){
               if(Math.abs(this.p.vx) <= this.p.speedLimit 
                ){
                    this.p.vx -= delta * this.p.ax; 
               }else{
                //this.p.ax *= -1;
                this.p.vx += delta * this.p.ax;
               }
               
            }
          }else{
            this.p.flip = "x";
          }
        }else if(this.p.vx >= 0){
          if(!this.p.asset){
            this.play("enemy_walk_right");        
            if(this.p.ax > 0 && this.p.accelerateSeeingPlayer ){
                if( Math.abs(this.p.vx) <= this.p.speedLimit ){
                    this.p.vx += delta * this.p.ax; 
                }else{
                   // this.p.ax *= -1;
                    this.p.vx -= delta * this.p.ax;
                }
                 
            }
          }else{
            this.p.flip = "";
          }
        }
        
    },
});//End of Enemy
Q.Enemy.extend("Ghost", {
    init: function(p){
        this._super(p, {       
            sheet: "ghost_25_35",
            sprite: "ghost_25_35",
            damageMp: 10,
            health: 20,
            speed: 100,
            speedMin: 100,
            speedLimit: 200,
            ax: 0,
        });
    }
});
Q.Enemy.extend("Ghost_red", {
    init: function(p){
        this._super(p, {       
            sheet: "ghost_red_25_35",
            sprite: "ghost_red_25_35",
            speed: 100,
            speedMin: 100,
            speedLimit: 200,
            ax: 0,
        });
    }
});
Q.Enemy.extend("RobotCar", {
    init: function(p){
        this._super(p, {
            asset: "robotCar.png",
            flip: "x",
            vx: 100,
            speedMin: 100,
            speedLimit: 200,
            ax: 35,
            damagePoints: 15,
            expPoints: 10,
            points: [[-22, -24], [-22, 24], [22, 24], [22, -24]],
        });
    }
});
Q.Enemy.extend("Bat", {
    init: function(p){
        this._super(p, {
            asset: "bat.png",
            flip: "x",
            vx: 200,
            speedMin: 200,
            speedLimit: 300,
            ax: 25,
            expPoints: 20,
            damagePoints: 15,
            gravity: 0,
        });
    }
});
Q.Enemy.extend("EvilGhost", {
    init: function(p){
        this._super(p, {
            asset: "evilGhost.png",
            flip:"x",
            vx: 60,
            speedMin: 60,
            speedLimit: 120,
            ax: 15,
            damagePoints: 25,
            expPoints: 15,
            gravity: 0,
        });
    }
});

Q.Enemy.extend("PurpleEye", {
    init:function(p){
        this._super(p, {
            asset: "purpleEye.png",
            flip: "x",
            damageMp: 40,
            expPoints: 15,
            vx: 100,
            speedMin: 100,
            speedLimit: 150,
            ax: 15,
        });
    }
});
Q.Enemy.extend("Skeleton", {
    init: function(p){
        this._super(p, {       
            sheet: "skeleton_36_48",
            sprite: "skeleton_36_48",
            scale:2,
            damagePoints:30,
            damageMp:10,
            expPoints: 20,
            health: 50,
            accelerateSeeingPlayer: true,
            ax: 20,
            speed: 100,
            speedMin: 100,
            speedLimit: 200,
            hasDeadAnim: true,
            //points: [[-1/2, 0], [-1/2, 1], [1/2, 1], [1/2, 0]],
            points: [[-9, -24], [-9, 24], [9, 24], [9, -24]],
        });
    }
});