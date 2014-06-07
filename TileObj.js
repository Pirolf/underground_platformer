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