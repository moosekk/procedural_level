"use strict";

class Player {
    position: THREE.Vector3;
    level: Level;
    keystate: { int: any }
    constructor(level, keyboard) {
	this.level = level;
	this.keystate = keyboard.state
	this.position = new THREE.Vector3();
    }
    update() {
	var _p = this.position.clone();
	var p = this.position;

        if (this.keystate['A'.charCodeAt(0)]) {
            p.set(p.x-0.1, p.y, p.z);
        }
        if (this.keystate['D'.charCodeAt(0)]) {
            p.set(p.x+0.1, p.y, p.z);
        }
        if (this.keystate['W'.charCodeAt(0)]) {
            p.set(p.x, p.y+0.1, p.z);
        }
        if (this.keystate['S'.charCodeAt(0)]) {
            p.set(p.x, p.y-0.1, p.z);
        }	

	var w = 0.5, h = 1.0;
	var bb = new Box(p.x-w, p.y-h, w*2, h);
	var b = this.level.boxes.find(b => b.intersectBox(bb))
	if (b) {
	    p.set(_p.x, _p.y, _p.z);
	}
	
    }
}


