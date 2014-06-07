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