"use strict";
/*
The Level class stores a set of objects in the level and contains functions
that test for connectedness of each object. Note that technically, connectedness
should be a function of the *character* and it's movement parameters.
*/
function linkRight(box:Box, gap, height, width) {
    return new Box(box.r + gap, box.t - height, width, height);
}
function linkUpr(box:Box) {
    return new Box(randi(box.x + 1, box.r + 3), box.t + 2, randi(1, 8), 1);
}
function linkUpl(box:Box) {
    var w = randi(1, 8); return new Box(randi(box.x-w-2, box.r-w-1), box.t+2, w, 1);
}
function linkUp(box:Box) {
    return randarr([linkUpl, linkUpr])(box);
}
function drop(box:Box) {
    var w = randi(4, 8), d = randi(5, 15);
    return new Box(box.r-w/2, box.y - d, w, randi(1, 4));
}
function * repeat(n, f) {
    for(var i=0; i<n; i++) yield f();
}
function * generate() {
    var cur = new Box(-5, -4, 10, 1);
    yield cur;
    var RIGHT = 0, UPRIGHT = 1, UPLEFT = 2, UP = 3, DROP = 4;
    var curdir = 0, prevdir = 0;
    yield * repeat(3, () => cur = linkRight(cur, 2, randi(1, 4), randi(1, 5)));
    for(var i=0; i<20; i++) {
        var newdir = randarr([RIGHT, RIGHT, RIGHT, UPRIGHT, UPLEFT, UP, DROP, DROP, DROP]);
        switch(newdir) {
        case RIGHT:
            if (prevdir == RIGHT) continue;            
            if (prevdir == UPLEFT)
                yield cur = linkUpl(cur);
            var f = () => cur = linkRight(cur, randi(1,5),randi(1,4),randi(1,5));
            yield * repeat(randi(3, 6), f);
            break;
        case 1:
            yield * repeat(4, () => cur = linkUpr(cur))
            break;
        case UPLEFT:
            if (prevdir == RIGHT) continue;
            cur.navi = "upl";
            yield * repeat(randi(1, 3), () => cur = linkUpl(cur))
            break;
        case UP:
            yield * repeat(randi(2, 6), () => cur = linkUp(cur))
            break;
        case DROP:
            if (prevdir == UPLEFT || prevdir == UP) continue;
            cur.navi = "drop";
            yield * repeat(randi(1, 3), () => cur = drop(cur));
            break;
        default: break;
        }
        curdir = newdir;
        prevdir = curdir;
    }
}

class Level {
    boxes: Box[];
    objects: any[];
    width: number; height: number;
    constructor() {
        this.boxes = [];
        var levelw = 100, levelh = 50
        this.width = levelw; this.height = levelh;
        for(var box of generate()) this.boxes.push(box);
        for(var i=0; i<this.boxes.length; i++) {
            var box = this.boxes[i];
            if (this.collide(box)) this.boxes[i] = null;
        }
        this.boxes = this.boxes.filter(x => x != null);
        this.objects = this.boxes.map(x => ({bounds: x}));
    }
    collide(box:Box) { return this.boxes.some(b => b && b != box && b.intersects(box)); }
    
    intersections(line:Line) { return this.boxes.some(b => b.intersects(line)); }

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
        ret.push(["signRight", new Point(-2, -2.5)]);        
	for(var i = 0; i < this.boxes.length; i++) {
	    var box = this.boxes[i];
            if (box.navi == "upl")
                ret.push(['signLeft', new Point(box.x + box.w / 2, box.t + 0.5)])
            if (box.navi == "drop")
                ret.push(['boxItem', new Point(box.r - 0.6, box.t - 0.6)])

            for(var j = box.w * 2; j --> 0;) {
		if (random() < 0.2) { 
		    ret.push([randarr(["bush", "grass", "rock", "grass", "bush", "grass", "rock", "mushroomBrown", "mushroomRed"]), new Point(box.x + 0.5 + random() * (box.w-1), box.t + 0.5)]);
		}
	    }
	}
        var sign = this.boxes[this.boxes.length-1].max
        ret.push(["signExit", {x:sign.x-1.5, y:sign.y+0.5}]);
        ret.push(["doorClosed_mid", {x:sign.x-2.5, y:sign.y+0.5}]);
        ret.push(["doorClosed_top", {x:sign.x-2.5, y:sign.y+1.5}]);                                
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
                        if (this.boxes.some(b => b.intersects(line))) continue;
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
