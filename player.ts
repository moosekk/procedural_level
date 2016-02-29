"use strict";
import V3 = THREE.Vector3;
class Player {
    position: THREE.Vector3;
    velocity: THREE.Vector3;    
    level: Level;
    keystate: { int: any }
    constructor(level, keyboard) {
        this.level = level;
        this.keystate = keyboard.state
        this.position = new THREE.Vector3(0, 0, 1);
        this.velocity = new THREE.Vector3();
    }
    update() {
        var _p = this.position.clone();
        var p = this.position;
        var v = this.velocity;
        var w = 0.7, h = 1;
        var level = this.level;
        var a = new THREE.Vector3(0, -0.01, 0);
        var isColliding = level.collide(new Box(p.x-w/4, p.y-h-0.1, w/2, 0.01));
        v.setX(0); // v.setY(0);
        if (this.keystate['A'.charCodeAt(0)]) v.setX(-0.1);
        if (this.keystate['D'.charCodeAt(0)]) v.setX(0.1);
        // if (this.keystate['W'.charCodeAt(0)]) v.setY(0.1);
        // if (this.keystate['S'.charCodeAt(0)]) v.setY(-0.1);
        if (this.keystate[' '.charCodeAt(0)] && isColliding) v.setY(0.25);
        if (v.lengthSq() < 1) v.set(a.x + v.x, a.y + v.y, a.z + v.z);
        var ignoreCollision = level.collide(new Box(p.x-w/2, p.y-h, w, h));
        function tryMove(tryVelocity) {
            var newPos = p.addVectors(p, tryVelocity);
            var newBox = new Box(newPos.x-w/2, newPos.y-h, w, h);
            if (!ignoreCollision) { 
                var collision = level.collide(newBox);
                if (collision) {
                    p.copy(_p);
                    return false;
                }
            }
            p.copy(newPos);
            return true;
        }
        // if we collide with something, try sliding along along a cardinal direction
        tryMove(v) || tryMove(new V3(v.x, 0, 0)) || tryMove(new V3(0, v.y, 0))
        this.velocity.set(p.x - _p.x, p.y - _p.y, p.z - _p.z);
    }
}


