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
            flip: ""
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
Q.Collectable.extend("Weapon", {
    init: function(p){
        this._super(p, {
            asset: "shotgun.png",
            weight: 35,
            type: Q.SPRITE_WEAPON,
            //gravity:0,
            x: 0,
            y: 0,
            relaXRight: 15, //relative x to player when facing right
            relaXLeft: -15,
            scale:0.3
        });
    },
    sensor: function(colObj){
        console.log("shotgun sensor called");
        sameWeapon = false;
        if(this === colObj.p.weapon){
            sameWeapon = true;
        }
        if(colObj.isA("Player")){
            if(colObj.p.hasWeapon && colObj.p.weapon && this !== colObj.p.weapon){
                console.log("remove weapon: " + colObj.p.weapon.className);
                console.log("before remove " + colObj.children.length);
                Q.stage().forceRemove(colObj.p.weapon);
                
                colObj.p.weapon.destroy();
                colObj.p.weapon = null;
                console.log(colObj.children.length);
            }
            
            if(colObj.p.facingDir === 1){
                this.set({x: this.p.relaXRight, y: 0, gravity:0});
                if(this.p.flip === "x"){
                    this.p.flip = "";
                }
            }else{
                this.set({x: this.p.relaXLeft, y: 0, gravity:0});
                if(this.p.flip === ""){
                    this.p.flip = "x";
                }
            }

            colObj.p.hasWeapon = true;
            colObj.p.weapon = this;
            if(!sameWeapon){
                Q.stage().insert(this, colObj);
            }         
        }
    },
});
Q.Weapon.extend("Shotgun", {
    init: function(p){
        this._super(p, {

        });
    }
})

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