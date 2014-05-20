//jQuery(document).ready(function(){
    var Q = Quintus()                          // Create a new engine instance
    .include("Sprites, Anim, Audio, Scenes, Input, 2D, Touch, UI, TMX") // Load any needed modules
    .setup({maximize: true})                           // Add a canvas element onto the page
    .controls()                        // Add in default controls (keyboard, buttons)
    .touch();                          // Add in touch support (for the UI)
    Q.enableSound();
    Q.setImageSmoothing(false);
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
        },
        step: function(delta){
                if(this.p.vx > 0){
                    if(this.p.landed > 0) {this.play("walk_right");}
                    else {this.play("jump_right");}
                }else if(this.p.vx < 0){
                    if(this.p.landed > 0) { this.play("walk_left");}
                    else{this.play("jump_left");}
                }else{
                   // this.play("stand_front");
                }
            }
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
            stand_front: { frames: [34], flip: false },
            stand_right: { frames: [34], rate: 1/4, flip: false, loop:false},
            stand_left:  { frames: [34], rate: 1/4, flip: "x", loop: false},
        });

    });
    Q.stageScene("level1");
});




//})
