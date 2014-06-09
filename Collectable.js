Q.Sprite.extend("Collectable", {
    init: function(p, defaults) {
        this._super(p, Q._defaults(defaults||{},{
           // sheet: p.sprite,
            type: Q.SPRITE_COLLECTABLE,
            collisionMask: Q.SPRITE_PLAYER,
            allowDrop: true,
            dropperId: -1,
            sensor: true,
            vx: 0,
            vy: 0,
            gravity: 0.3,
            weight: 10,
            SPAWN_TIME: 2000,
        }));
        this.add("animation, 2d, coll");
        this.on("sensor");

        if(!(Q.collClass)[this.className]){
          Q.collClass[this.className] =  {
            "name": this.className,
            "range": [currTotalWeight, currTotalWeight + this.p.weight]
            };
          currTotalWeight += this.p.weight;
          //console.log(Q.collClass);  
        }       
    }, //init
    // When a Collectable is hit.
    sensor: function(colObj) {
        //return;
        Q.stageScene("hud", 2, colObj.p);
    }
});
//Weapons

Q.Collectable.extend("Shotgun", {
    init: function(p){
        this._super(p, {
            asset: "/weapons/shotgun.png",
            weight: 5,
        });
    },
    sensor: function(colObj){
        console.log("shotgun sensor called");
        if(colObj.isA("Player")){
            colObj.p.hasWeapon = true;
        }
    },
});


//Potions
Q.Collectable.extend("Potion_red", {
    init: function(p){
        this._super(p, {
            asset: "potion_red_20_20.png",
            weight: 15,
            //sprite:"potion_red_12_12",
            deltaStrength: 5,
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