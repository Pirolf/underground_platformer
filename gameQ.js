//jQuery(document).ready(function(){
    var Q = Quintus()                          // Create a new engine instance
    .include("Sprites, Anim, Audio, Scenes, Input, 2D, Touch, UI, TMX") // Load any needed modules
    .setup({maximize: true})                           // Add a canvas element onto the page
    .controls()                        // Add in default controls (keyboard, buttons)
    .touch();                          // Add in touch support (for the UI)
    Q.enableSound();
    Q.setImageSmoothing(false);

    //global vars
    var isDown = false;
    var facingRight = true;
    Q.Sprite.extend("Player",{
        init: function(p){
            this._super(p, {
                sheet: "platformer_sprites0",
                sprite: "platformer_sprites0",
                frame: 34,
                hitPoints: 10,
                damage: 5,
                x: 5,
                y: 1
            });
            this.add("2d, animation");
            this.add('platformerControls');
            Q.sheet("platformer_sprites0", "platformer_sprites0.png",{
                tilew: 64,
                tileh: 64
            });
            Q.input.keyboardControls({
                DOWN: "goDown"
            });
        },
        step: function(delta){
                if(this.p.vx > 0){
                    facingRight = true;
                    if(this.p.landed > 0) {this.play("walk_right");}
                    else {this.play("jump_right");}
                }else if(this.p.vx < 0){
                    facingRight = false;
                    if(this.p.landed > 0) { this.play("walk_left");}
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
// Load TMX File as a scene
Q.scene("level1", function(stage){
    Q.stageTMX("underground.tmx", stage);
    var player = Q("Player").first({vx:0,vy:0});
});
// Load assets and launch the first scene to start the game
Q.loadTMX("underground.tmx", function(){
    Q.compileSheets("platformer_sprites0.png");
    //Q.stageScene("level1");
    Q.load(["platformer_sprites0.png", "37_walk.jpg"], function(){      
        Q.animations("platformer_sprites0", {
            walk_right:  { frames: [34,35,36,37], rate: 1/4, flip: false, loop: true, next: 'stand_right' },
            walk_left:   { frames: [34,35,36,37], rate: 1/4, flip: "x",   loop: true, next: 'stand_left' },
            jump_right:  { frames: [43,44,44,44,44,44,44,45,45,45,45,46,47], rate: 1/10, next: "stand_right", flip: false },
            jump_left:  { frames: [43,44,44,44,44,44,44,45,45,45,45,46,47], rate: 1/10, next: "stand_left", flip: "x" },
            jump_up_facingRight: {frames:[51], rate:1/2, loop:false, next: "stand_right"},
            jump_up_faingLeft: {frames:[51], rate:1/2, loop:false, flip:"x", next: "stand_left"},
            stand_front: { frames: [34], flip: false },
            stand_right: { frames: [34], rate: 1/4, flip: false, loop:false},
            stand_left:  { frames: [34], rate: 1/4, flip: "x", loop: false},
            get_down_right: {frames:[17,18,19,20,21,22], rate: 1/8, loop:false},
            get_down_left: {frames:[17,18,19,20,21,22], rate: 1/8, flip:"x", loop:false},
            down_right: {frames: [22], rate: 1, flip:false, loop:true},
            down_left: {frames: [22], rate: 1, flip:"x", loop:true},
        });

    });
    Q.stageScene("level1");
});




//})
