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
        this.setScore();
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
        if (this.keystate[' '.charCodeAt(0)] && isColliding) v.setY(0.25);
        if (v.lengthSq() < 1) v.set(a.x + v.x, a.y + v.y, a.z + v.z);
        var ignoreCollision = level.collide(new Box(p.x-w/2, p.y-h, w, h));
        if (ignoreCollision === level.exit) this.win();
        function tryMove(tryVelocity) {
            var newPos = p.addVectors(p, tryVelocity);
            var newBox = new Box(newPos.x-w/2, newPos.y-h, w, h);
            if (!ignoreCollision) {
                var collision = level.collide(newBox);
                if (collision === level.exit) { this.win(); return true; }
                else if (collision) {
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
    win() {
        if (window['won']) return;
        var hash = +window.location.hash.slice(1);
        alert("You win level " + hash);
        var r = JSON.parse(localStorage.getItem('results') || '{}');
        var rr = r[hash] || {};
        rr.completed = 1;
        rr.date = new Date();
        r[hash] = rr;
        localStorage.setItem('results', JSON.stringify(r));
        window['randomize'].click();
        window['won'] = 1;
    }
    setScore() {
        var r = JSON.parse(localStorage.getItem('results') || '{}');
        for(var key in r) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + key;
            a.innerHTML = key;
            li.appendChild(a);
            window['toplistul'].appendChild(li);
        }
    }
}
