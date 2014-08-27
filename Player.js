 //Player class
 Q.Sprite.extend("Player",{
    init: function(p){
        this._super(p, {
            sheet: "platformer_sprites0",
            sprite: "platformer_sprites0",
            type: Q.SPRITE_PLAYER,
            frame: 34,
            strength: 100,
            magicPoints: 100,
            score: 0,
            MAX_STRENGTH: 100,
            MAX_MP: 100,
            jumpSpeed: -500,
            speed: 400,
            hitPoints: 10,
            onLadder:false,
            isCrouching: false,
            standingPoints: [[8, 0], [8, -32], [8, 32], [-8, 32], [-8, -32],[-8, 0]],
            damage: 5,
            immune: false,
            BULLET_MIN_INTERVAL: 1000,
            bulletFiredTimer: 2000,
            mpRecoverTimer: 0,
                MP_RECOVER_TIME: 24, //in frames
                facingDir: 1, //1 for right, -1 for left
                x: 5,
                y: 1,
                hasWeapon: false,
                weapon: null,
                collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_COLLECTABLE | Q.SPRITE_DOOR 
            });
        Q.END_OF_GAME_STATS.HP = this.p.strength;
        Q.END_OF_GAME_STATS.MP = this.p.magicPoints;
        Q.END_OF_GAME_STATS.SCORE = this.p.score;
        this.p.points = this.p.standingPoints;
        this.add("2d, animation, platformerControls, tween");
        this.on("enemy.hit","enemyHit");
        this.on("sensor.tile","checkLadder");


        Q.sheet("platformer_sprites0", "platformer_sprites0.png",{
            tilew: 64,
            tileh: 64
        });
        Q.input.keyboardControls({
            DOWN: "goDown"
        });
            //bind W to checkDoor  
            Q.input.keyboardControls({
                "87": "check_door"
            });
            Q.input.on("check_door",this,"checkDoor");
            Q.input.on("fire", this, "fireBullet");
        }, //end of init 
        __canFire: function(){
            console.log(Q.Bullet.CONSUME_MP);
            if(this.p.magicPoints >= Q.Bullet.CONSUME_MP && this.p.landed > 0 && !this.p.onLadder && !this.p.isCrouching){
                return true;
            }
            return false;
        },
        resetLevel: function(){           
            Q.stageScene("level1");
            this.p.strength = this.p.MAX_STRENGTH;
            this.p.magicPoints = this.p.MAX_MP;
            this.p.speed=0;
            this.p.facingDir=1;
            this.animate({opacity: 1});
            Q.stageScene('hud', 2, this.p);
        },
        checkDoor: function(){
            this.p.checkDoor = true;
        },
        checkLadder: function(colObj){
            if(colObj.p.ladder) { 
                this.p.onLadder = true;
                this.p.ladderX = colObj.p.x;
            }
        },
        continueOverSensor: function() {
            this.p.vy = 0;
            if(this.p.vx != 0) {
                this.play("run_" + this.p.direction);
            } else {
                if(this.p.isClimbing){
                 this.play("climb_still");
             }else{
                this.play("stand_" + this.p.direction); 
            }                
        }
    },
    enemyHit: function(data){
        var col = data.col;
        var enemy = data.enemy;
        this.p.immune = true;
        if(this.p.strength > 0){
            this.p.strength -= enemy.p.damagePoints;
            Q.stageScene('hud', 2, this.p);
        }
        this.p.magicPoints -= enemy.p.damageMp;
        this.p.magicPoints = Math.max(0, this.p.magicPoints);
        Q.stageScene('hud', 2, this.p);
            this.p.immuneTimer = 0;
            this.p.immuneOpacity = 1;

        },
    fireBullet: function(){
            if(this.__canFire() && this.p.bulletFiredTimer >= this.p.BULLET_MIN_INTERVAL * 12/1000.0){  
                var p = this.p;
                var playerDir = this.p.facingDir;
                var newBullet = new Q.Bullet({ 
                    x: this.p.x + playerDir * (this.p.w)/4,
                    y: this.p.y + (this.p.h)/8,
                    vx: playerDir * 400,
                    vy: 0,
                    intervalTimer: 0,
                    shot: true,
                });
                this.p.bulletFiredTimer = 0;
                this.p.magicPoints -= Q.Bullet.CONSUME_MP;
                Q.stageScene("hud", 2, this.p);
                this.stage.insert(newBullet);   
            }

        },
    updateEndOfGameStats: function(){
        Q.END_OF_GAME_STATS.HP = this.p.strength;
        Q.END_OF_GAME_STATS.MP = this.p.magicPoints;
        Q.END_OF_GAME_STATS.SCORE = this.p.score;
    },
    step: function(delta){
            var processed = false;
            if (this.p.strength <= 0) {
               this.updateEndOfGameStats();
                Q.stageScene("endGame", 1, { label: "Game Over!" }); 
                this.destroy();
                return;
           } 
           this.p.bulletFiredTimer++;

            //check left boundary
            if(this.p.x < boundingBox.minX){
                this.p.x = boundingBox.minX;
            }
            if(this.p.y <= 0){
                this.p.y = 0;
            }else if(this.p.y >= boundingBox.maxY){
                this.p.y = boundingBox.maxY;
            }
            
            if(this.p.hasWeapon && this.p.weapon){
                weapon = this.p.weapon;
               // console.log("p.facingDir : " + this.p.facingDir);
               if(this.p.facingDir === 1){
                 if(weapon.p.flip === "x"){
                    weapon.set("flip", "");
                }
            }else{
             if(weapon.p.flip === ""){
                 weapon.set("flip", "x");
             } 
         }
     }
            //prevent continuous hitting           
            if (this.p.immune) {               
                var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
                this.animate({"opacity":opacity}, 0);
                this.p.immuneOpacity = opacity;
                this.p.immuneTimer++;
                if (this.p.immuneTimer > 12) {
                // 3 seconds expired, remove immunity.
                this.p.immune = false;
                this.animate({"opacity": 1}, 1);
            }
        }
        if(this.p.magicPoints < this.p.MAX_MP){
            this.p.mpRecoverTimer ++;
            if(this.p.mpRecoverTimer >= this.p.MP_RECOVER_TIME){
                this.p.mpRecoverTimer = 0;
                this.p.magicPoints++;
                Q.stageScene("hud", 2, this.p);
            }
        }else{
            this.p.mpRecoverTimer = 0;
            Q.stageScene("hud", 2, this.p);
        }
        if(this.p.onLadder) {
            this.p.gravity = 0;
            if(Q.inputs['up']) {
                this.p.isClimbing = true;
                this.p.vy = -this.p.speed;
                this.p.x = this.p.ladderX;
                this.play("climb");
            } else if(Q.inputs['goDown']) {
                this.p.isClimbing = true;
                this.p.vy = this.p.speed;
                this.p.x = this.p.ladderX;
                this.play("climb");
            } else {
                this.continueOverSensor();
            }
            processed = true;
        }
            //check door 
            if(!processed && this.p.door){
                this.p.gravity = 1;
                if(this.p.checkDoor && this.p.landed > 0) {
                // Enter door.
                this.p.y = this.p.door.p.y;
                this.p.x = this.p.door.p.x;
                this.play('climb');
                this.p.toDoor = this.p.door.findRandomDoor();
                processed = true;
            }
            else if (this.p.toDoor) {
                // Transport to matching door.
                this.p.y = this.p.toDoor.p.y;
                this.p.x = this.p.toDoor.p.x;
                this.stage.centerOn(this.p.x, this.p.y);
                this.p.toDoor = false;

                processed = true;
            }
            }//end of door checking
            if(!processed) { 
                this.p.gravity = 1;
                if(this.p.vx > 0){
                    facingRight = true;
                    this.p.facingDir = 1;
                    if(this.p.landed > 0) {this.play("run_right");}
                    else {this.play("jump_right");}
                }else if(this.p.vx < 0){
                    facingRight = false;
                    this.p.facingDir = -1;
                    if(this.p.landed > 0) { this.play("run_left");}
                    else{this.play("jump_left");}
                }else if(this.p.vx == 0 && this.p.landed <= 0){
                    if(this.p.landed <= 0){     
                        if(facingRight){
                            this.p.facingDir = 1;
                            this.play("jump_up_facingRight");
                        }else{
                            this.p.facingDir = -1;
                            this.play("jump_up_faingLeft");
                        }
                    }else{
                        this.p.facingDir = 1;
                    }
                }else if(Q.inputs['goDown'] && !this.p.onLadder){
                    if(this.p.isCrouching){
                   //isDown = true;
                   this.p.isCrouching = true;
                   if(facingRight){
                    this.play("down_right");
                }else{
                    this.play("down_left");
                }
            }else if(this.p.vx == 0 && this.p.vy == 0 && this.p.landed > 0){
                   // isDown = true;
                   this.p.isCrouching = true;
                   if(facingRight){
                     this.play("get_down_right");  
                 }else{
                     this.play("get_down_left");  
                 }                                
             }
         }else if(!Q.inputs["goDown"]){
                //isDown = false;
                this.p.isCrouching = false;
                if(facingRight){
                    this.play("stand_right");
                }else{
                    this.play("stand_left");
                }
            }
        }//end of !processed
        this.p.onLadder = false;
       // this.p.isCrouching = false;
       this.p.door = false;
       this.p.checkDoor = false;
   },
});