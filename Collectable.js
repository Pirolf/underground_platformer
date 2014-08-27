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
            flip: "",
            //add-on effects
            offset_fireDamage: 0,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: null, //by default null, numeric only for non instants
        }));
        this.add("animation, 2d, coll");
        this.on("sensor");
        var selfThis = this;
        this.pushToQClassList(selfThis);
        
        
    }, //init
    pushToQClassList: function(selfThis){
        if(!(Q.collClass)[selfThis.className]){
          Q.collClass[selfThis.className] =  {
            "name": selfThis.className,
            "range": [currTotalWeight, currTotalWeight + selfThis.p.weight]
            };
          currTotalWeight += selfThis.p.weight; 
        }       
    },
    // When a Collectable is hit.
    sensor: function(colObj) {
        /*
         console.log(this.className + " sensor called");
        if(colObj.isA("Player")){
            if(colObj.p.strength <= colObj.p.MAX_STRENGTH - this.p.deltaStrength){
                colObj.p.strength += this.p.deltaStrength;
                Q.stageScene('hud', 2, colObj.p);

            }
           // colObj.play("stand_front");  
            this.destroy();
        }
        return;
        */
       // Q.stageScene("hud", 2, colObj.p);
    }
});

//Weapons
Q.Collectable.extend("Weapon", {
    init: function(p, defaults){
        this._super(p, Q._defaults(defaults || {}, {
            asset: "shotgun.png",
            weight: 15,
            type: Q.SPRITE_WEAPON,
            //gravity:0,
            x: 0,
            y: 0,
            relaXRight: 15, //relative x to player when facing right
            relaXLeft: -15,
            scale:0.3,
            flip: "",
            //weapon only fields:
            onPlayerTimer: 0, //keeps track of the time the weapon is carried by player
            pickeUp: false,
            //add-on effects: defaults for weapons
            offset_fireDamage: 0,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: 180, // in seconds
        }));
    },
    sensor: function(colObj){
        sameWeapon = false;
        if(this === colObj.p.weapon){
            sameWeapon = true;
        }
        if(colObj.isA("Player")){
            if(colObj.p.hasWeapon && colObj.p.weapon && this !== colObj.p.weapon){
                console.log("remove weapon: " + colObj.p.weapon.className);
                console.log("before remove " + colObj.children.length);
                //colObj.p.weapon.destroy();
                Q.stage().forceRemove(colObj.p.weapon);
                
                
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
                this.p.onPlayerTimer = 0;
                this.p.pickedUp = true;
            }         
        }
    }, //end of sensor
    step: function(delta){
        if(this.p.pickedUp){
            if(this.p.onPlayerTimer < this.p.effectiveTime){
                this.p.onPlayerTimer++;
               // console.log("onPlayerTimer: " + this.p.onPlayerTimer);  
            }else{
              //effective time passed, remove weapon and destroy
                player = Q("Player").first();
                player.p.hasWeapon = false;
                this.destroy();
               // Q.stage().forceRemove(this); 
                console.log(this.className + " effective time passed, weapon removed");               
            }                  
        }
    },

});
Q.Weapon.extend("Shotgun", {
    init: function(p, defaults){
        this._super(p, Q._defaults(defaults||{},{
            asset: "shotgun.png",
            weight: 35,
            offset_fireDamage: 5,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: 360, //in seconds  
        }));
        console.log(this.className + ": " + this.p.weight);
    },
})
Q.Weapon.extend("MediumGun", {
    init: function(p){
        this._super(p, {
            asset: "mediumGun.png",
            scale: 0.2,
            weight: 25,
            offset_fireDamage: 10,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: 360, //in seconds
        });  
    },
}); 
Q.Weapon.extend("LongGun", {
    init: function(p){
        this._super(p, {
            asset: "longScifiGun.png",
            scale: 0.2,
            weight: 15,
            offset_fireDamage: 15,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: 720, //in seconds    
        });
    }
});

Q.Weapon.extend("BusterGun", {
    init: function(p){
        this._super(p, {
            asset: "buster.png",
            scale: 0.3,
            weight: 20,
            offset_fireDamage: 20,
            offset_MPRecoverTime: 0,
            offset_bulletMinInterval: 0,
            deltaStrength: 0,
            effectiveTime: 720, //in seconds    
        });
    }
});
Q.Collectable.extend("InstantColl", {
    init: function(p, defaults){
        this._super(p, Q._defaults(defaults || {}, {
            sensorCalled: false,
            deltaStrength: 0,
            deltaMP: 0,
        }));
    },
    sensor: function(colObj){
        if(this.p.sensorCalled){
            return;
        }
        this.p.sensorCalled = true;
        console.log(this.className + " sensor called");
        if(colObj.isA("Player")){
            if(colObj.p.strength + this.p.deltaStrength <= colObj.p.MAX_STRENGTH 
                && colObj.p.strength + this.p.deltaStrength >= 0){
                colObj.p.strength += this.p.deltaStrength;
                Q.stageScene('hud', 2, colObj.p);
            }
            if(colObj.p.magicPoints + this.p.deltaMP <= colObj.p.MAX_MP 
                && colObj.p.magicPoints + this.p.deltaMP >= 0){
                colObj.p.magicPoints += this.p.deltaMP;
            }
            this.destroy();
        }
        return;
    }
});
Q.InstantColl.extend("Potion_blue", {
    init: function(p, defaults){
        this._super(p, Q._defaults(defaults || {}, {
            asset: "potion_blue_20_20.png",
            weight:30,
            deltaStrength: 10,
            deltaMP: 10,
        }));
    }
});
//Potions
Q.InstantColl.extend("Potion_red", {
    init: function(p, defaults){
        this._super(p, Q._defaults(defaults || {}, {
            asset: "potion_red_20_20.png",
            weight: 15,
            deltaStrength: 5,
        }));
    },
    
    
    
});