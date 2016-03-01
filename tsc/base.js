"use strict";
var Point = THREE.Vector2;
class Box extends THREE.Box2 {
    constructor(x, y, w, h) {
        super(new Point(x, y), new Point(x + w, y + h));
        this.x = x;
        this.y = y;
        this.r = x + w;
        this.t = y + h;
        this.h = h;
        this.w = w;
    }
    intersects(o) {
        if (o instanceof Box)
            return super.intersectsBox(o);
        if (o instanceof Point)
            return this.containsPoint(o);
    }
}
var random = (function (i) { return function () { return (Math.sin(i++) + 1) * 10000 % 1; }; })(0);
function randi(a, b) { return a + (random() * (b - a)) | 0; }
function randarr(arr) { return arr[random() * arr.length | 0]; }
