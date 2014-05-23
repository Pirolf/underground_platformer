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
    var isDown = false;
    var facingRight = true;
    //constants
    Q.SPRITE_PLAYER = 1;
    Q.SPRITE_COLLECTABLE = 2;
    Q.SPRITE_ENEMY = 4;
    Q.SPRITE_DOOR = 8;
    //Player class
    Q.Sprite.extend("Player",{
        init: function(p){
            this._super(p, {
                sheet: "platformer_sprites0",
                sprite: "platformer_sprites0",
                type: Q.SPRITE_PLAYER,
                frame: 34,
                strength: 100,
                MAX_STRENGTH: 100,
                jumpSpeed: -550,
                speed: 400,
                hitPoints: 10,
                standingPoints: [[8, 0], [8, -32], [8, 32], [-8, 32], [-8, -32],[-8, 0]],
                damage: 5,
                immune: false,
                x: 5,
                y: 1,
                collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_COLLECTABLE
            });
            this.p.points = this.p.standingPoints;
            this.add("2d, animation, platformerControls, tween");
            this.on("enemy.hit","enemyHit");
            Q.sheet("platformer_sprites0", "platformer_sprites0.png",{
                tilew: 64,
                tileh: 64
            });
            Q.input.keyboardControls({
                DOWN: "goDown"
            });
        }, //end of init 

        enemyHit: function(data){
            var col = data.col;
            var enemy = data.enemy;
            this.p.immune = true;
            if(this.p.strength > 0){
                this.p.strength -= 10;
            }
            console.log(this.p.strength);  
            this.p.immuneTimer = 0;
            this.p.immuneOpacity = 1;
            /*
            if(col.normalX == 1){
                //hit from left
                this.p.x += 10;
            }else{
                //hit from right
                this.p.x -= 10;
            }
            */
            
        },
        step: function(delta){
            var processed = false; 
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

            
            if(this.p.vx > 0){
                facingRight = true;
                if(this.p.landed > 0) {this.play("run_right");}
                else {this.play("jump_right");}
            }else if(this.p.vx < 0){
                facingRight = false;
                if(this.p.landed > 0) { this.play("run_left");}
                else{this.play("jump_left");}
            }else if(this.p.vx == 0 && this.p.landed <= 0){
                if(facingRight){
                    this.play("jump_up_facingRight");
                }else{
                    this.play("jump_up_faingLeft");
                }
            }else if(Q.inputs['goDown']){
                if(isDown){
                    isDown = true;
                    if(facingRight){
                        this.play("down_right");
                    }else{
                        this.play("down_left");
                    }
                }else if(this.p.vx == 0 && this.p.vy == 0 && this.p.landed > 0){
                    isDown = true;
                    if(facingRight){
                       this.play("get_down_right");  
                   }else{
                       this.play("get_down_left");  
                   }                                
               }
           }else if(!Q.inputs["goDown"]){
            isDown = false;
            if(facingRight){
                this.play("stand_right");
            }else{
                this.play("stand_left");
            }
        }
    },
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
    }
});
//Enemy class
Q.Sprite.extend("Enemy", {
    init: function(p, defaults){
        //this._super(p, {
        this._super(p,Q._defaults(defaults||{},{
            sheet: p.sprite,
            //sheet: "ghost_25_35",
            //sprite: "ghost_25_35",
            type: Q.SPRITE_ENEMY,
            frame: 1,
            //speed:300,
            vx: -100,
            //ax: -100
            collisionMask: Q.SPRITE_DEFAULT,
        }));
        this.add("2d, aiBounce, animation"); 
        this.on("bump.top",this,"die");
        this.on("hit.sprite",this,"hit");   
    },
    hit: function(col) {
        if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
            col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
            console.log(col.obj.p.cx +", " + this.p.cx);
        }
        return;
    },
    die: function(col) {
        if(col.obj.isA("Player")) {
            this.p.vx=this.p.vy=0;
            //TODO: enemy dead anim
            //this.play('dead');
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
            }
            this.destroy();
        }
        return;
    }
});
// Load TMX File as a scene
Q.scene("level1", function(stage){
    Q.stageTMX("underground.tmx", stage);
    var player = Q("Player").first({vx:0,vy:0});
    var blue_ghost = Q("Enemy").first();
    stage.add("viewport").follow(Q("Player").first());
});
// Load assets and launch the first scene to start the game
Q.loadTMX("underground.tmx", function(){
    Q.compileSheets("platformer_sprites0.png");
    Q.compileSheets("ghost_25_35.png");
    Q.compileSheets("ghost_red_25_35.png");
    Q.compileSheets("potion_red_20_20.png");
    //Q.stageScene("level1");
    Q.load(["platformer_sprites0.png", "37_walk.jpg",
     "ghost_25_35.png", "ghost_red_25_35.png", "potion_red_20_20.png"], function(){     
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
        });
        Q.animations("ghost_25_35",{
            enemy_walk_left: {frames:[5,6,7,8,9], flip:"x", rate: 1/2, loop:true},
            enemy_walk_right: {frames:[5,6,7,8,9], flip:false, rate: 1/2, loop:true}
        });
        Q.animations("ghost_red_25_35",{
            enemy_walk_left: {frames:[5,6,7,8,9], flip:"x", rate: 1/2, loop:true},
            enemy_walk_right: {frames:[5,6,7,8,9], flip:false, rate: 1/2, loop:true}
        });
});
Q.stageScene("level1");
});




//})
