//jQuery(document).ready(function(){
    var Q = Quintus()                          // Create a new engine instance
    .include("Sprites, Anim, Audio, Scenes, Input, 2D, Touch, UI, TMX") // Load any needed modules
    .setup({maximize: true})                           // Add a canvas element onto the page
    .controls()                        // Add in default controls (keyboard, buttons)
    .touch();                          // Add in touch support (for the UI)
    Q.enableSound();
    Q.setImageSmoothing(false);
    Q.debug = true;
    Q.debugFull = true;
    //global vars
    //var isDown = false;
    var facingRight = true;
    //constants
    Q.SPRITE_PLAYER = 1;
    Q.SPRITE_COLLECTABLE = 2;
    Q.SPRITE_ENEMY = 4;
    Q.SPRITE_DOOR = 8;
    Q.SPRITE_BULLET = 16;
    //Player class
    Q.Sprite.extend("Player",{
        init: function(p){
            this._super(p, {
                sheet: "platformer_sprites0",
                sprite: "platformer_sprites0",
                type: Q.SPRITE_PLAYER,
                frame: 34,
                strength: 100,
                score: 0,
                MAX_STRENGTH: 100,
                jumpSpeed: -550,
                speed: 400,
                hitPoints: 10,
                onLadder:false,
                isCrouching: false,
                standingPoints: [[8, 0], [8, -32], [8, 32], [-8, 32], [-8, -32],[-8, 0]],
                damage: 5,
                immune: false,
                BULLET_MIN_INTERVAL: 2000,
                bulletFiredTimer: 2000,
                facingDir: 1, //1 for right, -1 for left
                x: 5,
                y: 1,
                collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_COLLECTABLE | Q.SPRITE_DOOR 
            });
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
            if(this.p.landed > 0 && !this.p.onLadder && !this.p.isCrouching){
                return true;
            }
            return false;
        },
        resetLevel: function(){           
            Q.stageScene("level1");
            this.p.strength = 100;
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
            console.log(this.p.strength);  
            this.p.immuneTimer = 0;
            this.p.immuneOpacity = 1;
            if (this.p.strength == 0) {
                this.resetLevel();
            }        
        },
        fireBullet: function(){
            if(this.__canFire() && this.p.bulletFiredTimer >= this.p.BULLET_MIN_INTERVAL * 12/1000.0){  
                var p = this.p;
                var playerDir = this.p.facingDir;
                var newBullet = new Q.Bullet({ 
                    x: this.c.points[0][0], 
                    y: this.c.points[0][1],
                    vx: playerDir * 200,
                    vy: 0,
                    intervalTimer: 0,
                    shot: true,
                });
                this.p.bulletFiredTimer = 0;
                this.stage.insert(newBullet);   
            }

        },

        step: function(delta){
            var processed = false;
            this.p.bulletFiredTimer++;
             
            //check left boundary
            if(this.p.x < 16){
                this.p.x = 16;
            }
            //prevent continuous hitting           
            if (this.p.immune) {               
                var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
                this.animate({"opacity":opacity}, 0);
                this.p.immuneOpacity = opacity;
                this.p.immuneTimer++;
                if (this.p.immuneTimer > 144) {
                // 3 seconds expired, remove immunity.
                    this.p.immune = false;
                    this.animate({"opacity": 1}, 1);
                }
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
                    //this.p.isClimbing = false;
                }
                processed = true;
                //this.p.isClimbing = false;
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
                    this.stage.follow(this);
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
                if(facingRight){
                    this.play("jump_up_facingRight");
                }else{
                    this.play("jump_up_faingLeft");
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

Q.Sprite.extend("Bullet", {
    init: function(p){
        this._super(p, {
            sheet: "explosions",
            sprite: "explosions",           
            type: Q.SPRITE_BULLET,
            collisionMask: Q.SPRITE_ENEMY,
            intervalInMS: 1000, //max life of a bullet
            intervalTimer: 0,
            hitTimer: 0,
            damageVal: 10,
            hasHit: false,
            vx: 500,
            vy: 0,
            gravity: 0,
            shot: true,
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
        
       // this.destroy();
       // return;
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
            //this.destroy();
        }else{
            //this.p.intervalTimer = 0;
            
        }      
    },
});
Q.Sprite.extend("Door", {
  init: function(p) {
    this._super(p,{
      //sheet: p.sprite,
      sheet: "underground",
      sprite: "underground",
      frame:11,
      type: Q.SPRITE_DOOR,
      collisionMask: Q.SPRITE_NONE,
      sensor: true,
      vx: 0,
      vy: 0,
      gravity: 0
    });
    this.add("animation");
    this.on("sensor");
  },
  findRandomDoor: function() {
    //return this.stage.find(this.p.link);
    var results = Q("Door");
    var randomDoorIndex = Math.floor(Math.random() * results.length);
    //while(randomDoorIndex === this.p.doorId){
    while(results.at(randomDoorIndex) === this){
        randomDoorIndex = Math.floor(Math.random() * results.length);
    }
    return results.at(randomDoorIndex);
  },
  // When the player is in the door.
  sensor: function(colObj) {
    // Mark the door object on the player.
    colObj.p.door = this;
  }
});

Q.Sprite.extend("Collectable", {
    init: function(p, defaults) {
        this._super(p, Q._defaults(defaults||{},{
           // sheet: p.sprite,
            type: Q.SPRITE_COLLECTABLE,
            collisionMask: Q.SPRITE_PLAYER,
            sensor: true,
            vx: 0,
            vy: 0,
            gravity: 0
        }));
        this.add("animation");
        this.on("sensor");
    }, //init
    // When a Collectable is hit.
    sensor: function(colObj) {
        //return;
        Q.stageScene("hud", 2, colObj.p);
    }
});
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
        });
        //this.size(false);
    }
});
Q.Collectable.extend("Potion_red", {
    init: function(p){
        this._super(p, {
            asset: "potion_red_20_20.png",
            //sprite:"potion_red_12_12",
            deltaStrength: 5
        });
    },
    sensor: function(colObj){
        console.log("red potion sensor called");
        if(colObj.isA("Player")){
            if(colObj.p.strength <= colObj.p.MAX_STRENGTH - this.p.deltaStrength){
                colObj.p.strength += this.p.deltaStrength;
                Q.stageScene('hud', 2, colObj.p);

            }
           // colObj.play("stand_front");  
            this.destroy();
        }
        return;
    }
});
// Load TMX File as a scene
Q.scene("level1", function(stage){
    Q.stageTMX("underground.tmx", stage);
    //var player = Q("Player").first({vx:0,vy:0});
    var blue_ghost = Q("Enemy").first();
    stage.add("viewport").follow(Q("Player").first());
});
Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));

  var score = container.insert(new Q.UI.Text({x:200, y: 20,
    label: "Score: " + stage.options.score, color: "white" }));

  var strength = container.insert(new Q.UI.Text({x:50, y: 20,
    label: "Health: " + stage.options.strength + '%', color: "white" }));

  container.fit(20);
});
// Load assets and launch the first scene to start the game
Q.loadTMX("underground.tmx", function(){
    Q.compileSheets("platformer_sprites0.png");
    Q.compileSheets("ghost_25_35.png");
    Q.compileSheets("ghost_red_25_35.png");
    Q.compileSheets("potion_red_20_20.png");
    Q.compileSheets("skeleton-36_48.png");
    Q.compileSheets("explosionSheet.png");
    //Q.stageScene("level1");
    Q.load(["platformer_sprites0.png", "37_walk.jpg", "explosionSheet.png",
     "ghost_25_35.png", "ghost_red_25_35.png", "potion_red_20_20.png", "skeleton-36_48.png"], function(){     
        var redPotion = new Q.Potion_red();
        Q.animations("platformer_sprites0", {
            run_right: { frames: [4, 5, 6, 7, 8, 9, 10, 11], rate: 1/8, flip: false, loop: true, next: 'stand_right' },
            run_left: { frames: [4, 5, 6, 7, 8, 9, 10, 11], rate: 1/8, flip: "x", loop: true, next: 'stand_right' },
            walk_right:  { frames: [34,35,36,37], rate: 1/4, flip: false, loop: true, next: 'stand_right' },
            walk_left:   { frames: [34,35,36,37], rate: 1/4, flip: "x",   loop: true, next: 'stand_left' },
            jump_right:  { frames: [43,44,44,44,44,44,44,45,45,45,45,46,47], rate: 1/10, next: "stand_right", flip: false },
            jump_left:  { frames: [43,44,44,44,44,44,44,45,45,45,45,46,47], rate: 1/10, next: "stand_left", flip: "x" },
            jump_up_facingRight: {frames:[51], rate:1/2, loop:false, next: "stand_right"},
            jump_up_faingLeft: {frames:[51], rate:1/2, loop:false, flip:"x", next: "stand_left"},
            stand_front: { frames: [34], flip: false },
            stand_right: { frames: [3], rate: 1/4, flip: false, loop:false},
            stand_left:  { frames: [3], rate: 1/4, flip: "x", loop: false},
            get_down_right: {frames:[17,18,19,20,21,22], rate: 1/8, loop:false},
            get_down_left: {frames:[17,18,19,20,21,22], rate: 1/8, flip:"x", loop:false},
            down_right: {frames: [22], rate: 1, flip:false, loop:true},
            down_left: {frames: [22], rate: 1, flip:"x", loop:true},
            climb: {frames: [26, 27], rate: 1/4, flip:false, loop:true},
            climb_still: {frames: [26], rate: 1, flip:false, loop:false}
        });
        Q.animations("ghost_25_35",{
            enemy_walk_left: {frames:[5,6,7,8,9], flip:"x", rate: 1/2, loop:true},
            enemy_walk_right: {frames:[5,6,7,8,9], flip:false, rate: 1/2, loop:true}
        });
        Q.animations("ghost_red_25_35",{
            enemy_walk_left: {frames:[5,6,7,8,9], flip:"x", rate: 1/2, loop:true},
            enemy_walk_right: {frames:[5,6,7,8,9], flip:false, rate: 1/2, loop:true}
        });
        Q.animations("skeleton_36_48",{
            enemy_walk_left: {frames:[2, 3, 4, 5, 6, 7, 8, 9], flip:"x", rate:1/12, loop:true},
            enemy_walk_right: {frames:[2, 3, 4, 5, 6, 7, 8, 9], flip:false, rate:1/12, loop:true},
            enemy_dead_left: {frames:[15,16,17,18,19], flip:"x", rate: 1/5, loop:false},
            enemy_dead_right:{frames:[15,16,17,18,19], flip:false, rate:1/5, loop:false},
        });
        Q.animations("explosions", {
            bullet_shoot: {frames:[7,6,5,4,3,2,2,2,2,2,2,2,2,2,2,2], rate:1/5, loop:false, next:"bullet_fade"},
            bullet_hit: {frames: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22], rate:1/24, loop:false},
            bullet_fade: {frames: [2], rate:1, loop:true}
        });

Q.stageScene("level1");
Q.stageScene('hud', 2, Q('Player').first().p);
});
});




//})
