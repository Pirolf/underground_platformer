//jQuery(document).ready(function(){
//$("button#start_plattt").click(function(){
    var Q = Quintus()                          // Create a new engine instance
    .include("Sprites, Anim, Audio, Scenes, Input, 2D, Touch, UI, TMX") // Load any needed modules
    .setup({maximize: true})                           // Add a canvas element onto the page
    .controls()                        // Add in default controls (keyboard, buttons)
    .touch();                          // Add in touch support (for the UI)
    Q.enableSound();
    Q.setImageSmoothing(false);
    //Q.debug = true;
    //Q.debugFull = true;
    //global vars
    //var isDown = false;
    var facingRight = true;
    var currTotalWeight = 0;
    var vp; //viewport
    var boundingBox = {minX:16, minY:0, maxX:99*64, maxY: 54*64};
    //constants
    Q.SPRITE_PLAYER = 1;
    Q.SPRITE_COLLECTABLE = 2;
    Q.SPRITE_ENEMY = 4;
    Q.SPRITE_DOOR = 8;
    Q.SPRITE_BULLET = 16;
    Q.SPRITE_WEAPON = 32;
    Q.END_OF_GAME_STATS = {HP: 0, MP: 0, SCORE: 0}
    Q.collClass = new Array();
    Q.component("coll", function(){

    });
// Load TMX File as a scene
Q.scene("level1", function(stage){
    Q.stageTMX("underground.tmx", stage);

    vp = stage.add("viewport");
    vp.follow(Q("Player").first(), {x: true, y:true}, boundingBox);
});

//end game scene
Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
}));
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
   label: "Play Again" })) ;

  box.insert(new Q.UI.Text({x: 10, y: -10- button.p.h, label: "Score: " + Q.END_OF_GAME_STATS.SCORE, color: "white"}));
  var label = box.insert(new Q.UI.Text({x:10, y: -50 - button.p.h, 
    label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
});
  box.fit(20);
});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
}));
  
  //container.insert(fbShareButton);
  var score = container.insert(new Q.UI.Text({x:200, y: 20,
    label: "Score: " + stage.options.score, color: "white"}));

  var strength = container.insert(new Q.UI.Text({x:50, y: 20,
    label: "Health: " + stage.options.strength + '%', color: "white" }));
  
  var magicPoints = container.insert(new Q.UI.Text({x: 350, y: 20,
    label: "Magic: " + stage.options.magicPoints, color: "white"}));

  container.fit(20);
});
// Load assets and launch the first scene to start the game
Q.loadTMX("underground.tmx", function(){
    Q.compileSheets("platformer_sprites0.png");
    Q.compileSheets("ghost_25_35.png");
    Q.compileSheets("ghost_red_25_35.png");
    Q.compileSheets("potion_red_20_20.png");
    Q.compileSheets("potion_blue_20_20.png");
    Q.compileSheets("skeleton-36_48.png");
    Q.compileSheets("explosionSheet.png");
    Q.compileSheets("shotgun.png");
    Q.compileSheets("mediumGun.png");
    Q.compileSheets("longScifiGun.png");
    Q.compileSheets("buster.png");
    Q.compileSheets("robotCar.png");
    Q.compileSheets("bat.png");
    Q.compileSheets("evilGhost.png");
    Q.compileSheets("purpleEye.png");
    Q.compileSheets("FlamingWizard.png");
    Q.load(["platformer_sprites0.png", "37_walk.jpg", "explosionSheet.png",
       "ghost_25_35.png", "ghost_red_25_35.png", "potion_red_20_20.png", "potion_blue_20_20.png",
       "skeleton-36_48.png", "robotCar.png", "shotgun.png", "mediumGun.png", "longScifiGun.png",
       "buster.png", "bat.png", "evilGhost.png", "purpleEye.png", "FlamingWizard.png"], function(){     
        var redPotion = new Q.Potion_red();
        var bluePotion = new Q.Potion_blue();
        var shotgun = new Q.Shotgun();
        var mediumGun = new Q.MediumGun();
        var longGun = new Q.LongGun();
        var busterGun = new Q.BusterGun();
        console.log(Q.collClass);
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
    enemy_dead_left: {frames:[15,16,17,18,19], flip:"x", rate: 1, loop:false},
    enemy_dead_right:{frames:[15,16,17,18,19], flip:false, rate:1, loop:false},
});
Q.animations("FlamingWizard", {
    enemy_walk_left: {frames:[2], flip: false, rate:1/12, loop:true},
    enemy_walk_right: {frames:[2], flip:"x", rate:1/12, loop:true},
    enemy_attack_left: {frames:[1], flip: false, rate:1/12, loop:true},
    enemy_attack_right: {frames:[1], flip:"x", rate:1/12, loop:true},
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




//});
