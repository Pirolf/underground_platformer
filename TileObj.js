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
    var results = Q("Door");
    var sameDoor = true;
    var currDoor;
    while(sameDoor){
        randomDoorIndex = Math.floor(Math.random() * results.length);
        console.log("total doors: " + results.length + ", doorIndex: " + randomDoorIndex);
        currDoor = results.at(randomDoorIndex);
        if(currDoor !== this){
          return currDoor;
        }
    }
  },
  // When the player is in the door.
  sensor: function(colObj) {
    // Mark the door object on the player.
    colObj.p.door = this;
  }
});