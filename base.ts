"use strict";
import Point = THREE.Vector2;
class Line {
    a: Point;
    b: Point;
    constructor(a,b,c,d) {
	this.a = new Point(a,b);
	this.b = new Point(c,d);
    }
    rmap(x, y) { return (x - this.a.x) * (this.b.y - this.a.y)
		 - (y - this.a.y) * (this.b.x - this.a.x); }
}
class Box extends THREE.Box2 {
    navi: any;
    x: number; y:number;
    r: number; t: number;
    w: number; h: number;
    constructor(x, y, w, h) {
        super(new Point(x, y), new Point(x + w, y + h))
        this.x = x; this.y = y; this.r = x + w; this.t = y + h; this.h = h; this.w = w;
    }
    intersects(o:Box|Line|Point) : boolean {
        if (o instanceof Box) return super.intersectsBox(o);
        if (o instanceof Line) return this.intersectLine(o);
        if (o instanceof Point) return this.containsPoint(o);
    }
    
    intersectLine(line:Line) {
        var t = [line.rmap(this.x, this.y),
                 line.rmap(this.x, this.t),
                 line.rmap(this.r, this.y),
                 line.rmap(this.r, this.t)]
        if (t[0] >= 0 && t[1] >=0 && t[2] >= 0 && t[3] >= 0) return false;
        if (t[0] <= 0 && t[1] <=0 && t[2] <= 0 && t[3] <= 0) return false;
        for(var i=0; i<=1; i+=0.02) {
            var p = line.a.multiplyScalar(1-i).add(line.b.multiplyScalar(i));
            if (this.intersects(p)) return true;
        }
        return false;
    }
}
var random = (function(i) { return function () { return (Math.sin(i++) + 1) * 10000 % 1; }; })(0);
function randi(a, b) { return a + (random() * (b - a)) | 0; }
function randarr(arr:any[]) { return arr[random() * arr.length | 0]; }
