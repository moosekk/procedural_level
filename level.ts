/*
The Level class stores a set of objects in the level and contains functions
that test for connectedness of each object. Note that technically, connectedness
should be a function of the *character* and it's movement parameters.
*/
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

class Box {
    w : number;
    h : number;
    x : number;
    y : number;
    t : number;
    r : number;
    c: Point;
    constructor(x, y, w, h) {
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
        this.t = y + h;
        this.r = x + w;
        this.c = new Point(x + w / 2, y + h / 2);
    }
    intersect(o:Point|Line|Box) {
        if (o instanceof Point) return this.intersectPt(o);
        if (o instanceof Line) return this.intersectLine(o);
        if (o instanceof Box) return this.intersectBox(o);
    }
    intersectPt(pt:Point) { return this.x < pt.x && pt.x < this.r && this.y < pt.y && pt.y < this.t; }
    intersectBox(box:Box) { return this.r > box.x && this.x < box.r && this.t > box.y && this.y < box.t; }
    intersectLine(line:Line) {
        var t = [line.rmap(this.x, this.y),
                 line.rmap(this.x, this.t),
                 line.rmap(this.r, this.y),
                 line.rmap(this.r, this.t)]
        if (t[0] >= 0 && t[1] >=0 && t[2] >= 0 && t[3] >= 0) return false;
        if (t[0] <= 0 && t[1] <=0 && t[2] <= 0 && t[3] <= 0) return false;

        for(var i=0; i<=1; i+=0.02) {
            var p = line.a.multiplyScalar(1-i).add(line.b.multiplyScalar(i));
            if (this.intersect(p)) return true;
        }
        if (1 === 1) return false;
    }
}

var random = (function(i) { return function () { return (Math.sin(i++) + 1) * 10000 % 1; }; })(0);

class Level {
    boxes: Box[];
    objects: any[];
    width: number; height: number;
    constructor() {
        this.boxes = [];
        var levelw = 100, levelh = 50
        this.width = levelw; this.height = levelh;
        this.boxes.push(new Box(-levelw/2, -50, 300, 10));
        this.boxes.push(new Box(-30, -20, 60, 10));
        this.boxes.push(new Box(30, 20, 60, 50));
        for(var i=0; i<100; i++) {
            this.boxes.push(new Box((random() * levelw - levelw / 2) | 0,
                                    (random() * levelh - levelh / 2) | 0,
                                    1 + random() * 10 | 0, 1))
        }
        this.objects = this.boxes.map(x => ({bounds: x}));
    }
    collide(box:Box) { return this.boxes.some(b => b.intersect(box)); }
    intersections(line:Line) { return this.boxes.some(b => b.intersect(line)); }

    * connect(_type, a,b,c,d) {   yield [_type, a,b,c,d];  }
    * connected (a:Box, b:Box) : Iterable<any> {
        var FALL_HEIGHT = 10, CLIP_WIDTH = 1, JUMP_WIDTH = 4, JUMP_HEIGHT = 4;
            if (a.t > b.t + FALL_HEIGHT) return null; // death by fall velocity
            var that = this;
            if (a.t >= b.t && a.t < b.t + FALL_HEIGHT) {
                if (b.x+CLIP_WIDTH < a.x && a.x < b.r-CLIP_WIDTH) yield *this.connect("drop", a.x, a.t, a.x, b.t);
                if (b.x+CLIP_WIDTH < a.r && a.r < b.r-CLIP_WIDTH) yield *this.connect("drop", a.r, a.t, a.r, b.t);

                if (a.x < b.r+JUMP_WIDTH && a.x > b.r) yield *this.connect('fall', a.x, a.t, b.r, b.t);
                if (a.r > b.x-JUMP_WIDTH && a.r < b.x) yield *this.connect('fall', a.r, a.t, b.x, b.t);
            }
            if (a.t > b.t - JUMP_HEIGHT && a.t < b.t) {
                if (a.x < b.r && b.r < a.r) yield *this.connect('jump', 0.5 * (b.r + a.r), a.t, b.r, b.t);
                if (a.x < b.x && b.x < a.r) yield *this.connect('jump', 0.5 * (b.x + a.x), a.t, b.x, b.t);

            }
            return null; // either too high up or we can't jump through overhang
    }
    doodads() {
	var ret = [];
	for(var i = 0; i < this.boxes.length; i++) {
	    var box = this.boxes[i];
	    for(var j = box.w; j --> 0;) {
		if (random() < 0.3) { 
		    ret.push([["bush", "grass", "rock"][random() * 3 | 0], new Point(box.x + 0.5 + random() * (box.w-1), box.t + 0.5)]);
		}
	    }
	}
	return ret;
    }
    connections() {
        var r = [];
        for(var i=0; i<this.objects.length; i++) {
            for(var j=0; j<this.objects.length; j++) {
                if (j === i) continue;
                var conns = (this.connected(this.objects[i].bounds, this.objects[j].bounds))
                for(var conn of conns) {
                    var start, end, type;
                    if (conn instanceof Array) {
                        type = conn[0]
                        var line = new Line(conn[1], conn[2], conn[3], conn[4]);
                        if (this.boxes.some(b => b.intersect(line))) continue;
                        start = {x:conn[1], y:conn[2]};
                        end =   {x:conn[3], y:conn[4]};
                    } else {
                        start = this.objects[i].bounds.c;
                        end = this.objects[j].bounds.c;
                        type = conn;
                    }
                    r.push({ i: i, j: j, start:start, end: end, type:type})
                }
            }
        }
        return r;
    }
}

function x_gap(a, b) {
    return Math.max(b.x - a.r, a.x - b.r)
}

function overhang(a, b) {
    if (b.x - a.x < 0 && a.r - b.r < 0) return -1
}
