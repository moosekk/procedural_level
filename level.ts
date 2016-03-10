"use strict";

function linkRight(box:Box, gap, height, width) {
    return new Box(box.r + gap, box.t - height, width, height);
}
function linkUpr(box:Box) {
    return new Box(randi(box.x + 1, box.r + 3), box.t + 2, randi(1, 8), 1);
}
function linkUpl(box:Box) {
    var w = randi(1, 8); return new Box(randi(box.x-w-2, box.r-w-1), box.t+2, w, 1);
}
function drop(box:Box) {
    var w = randi(4, 8), d = randi(5, 15);
    return new Box(box.r-w/2, box.y - d, w, randi(1, 4));
}
function * generate() {
    var newbox = new Box(-5, -4, 10, 1);
    yield newbox;
    function * repeat(n, f) { for(var i=0; i<n; i++) yield newbox = f(newbox); }
    var RIGHT = 0, UPRIGHT = 1, UPLEFT = 2, UP = 3, DROP = 4;
    var prevdir = 0;
    yield * repeat(3, () => newbox = linkRight(newbox, 2, randi(1, 4), randi(1, 5)));
    for(var i=localStorage.getItem('level_size') || 20; i-->0; ) {
        var newdir = randarr([RIGHT, RIGHT, RIGHT, UPRIGHT, UPLEFT, UP, DROP, DROP, DROP]);
        switch(newdir) {
        case RIGHT:
            if (prevdir == RIGHT) continue;
            if (prevdir == UPLEFT)
                yield newbox = linkUpr(newbox);
            yield * repeat(randi(3, 6), cur =>linkRight(cur, randi(1,5),randi(1,4),randi(1,5))); break;
        case UPRIGHT:  yield * repeat(4, linkUpr); break;
        case UPLEFT:
            if (prevdir == RIGHT) continue;
            newbox.navi = "upl";
            yield * repeat(randi(1, 3), linkUpl); break;
        case UP:
            yield * repeat(randi(2, 6), randarr([linkUpl, linkUpr])); break;
        case DROP:
            if (prevdir == UPLEFT || prevdir == UP) continue;
            newbox.navi = "drop";
            yield * repeat(randi(1, 3), drop); break;
        default: break;
        }
        prevdir = newdir;
    }
    yield linkRight(newbox, 2, 5, 5);
}

class Level {
    boxes: Box[]; exit: Box;
    objects: any[];
    width: number; height: number;
    constructor() {
        this.boxes = [];
        var levelw = 100, levelh = 50
        this.width = levelw; this.height = levelh;
        for(var gbox of generate()) this.boxes.push(gbox);
        // this.boxes = this.boxes.filter(_box => !this.collide(_box));
        for(var i=0; i<this.boxes.length; i++) {
            var box = this.boxes[i];
            var _box = new Box(box.x, box.y-101, box.w, 100);
            if (!this.collide(_box))
                this.boxes[i] = new Box(box.x, box.y-100, box.w, 100 + box.h);
        }
        this.objects = this.boxes.map(x => ({bounds: x}));
    }
    collide(box:Box) : Box { return this.boxes.find(b => b && b != box && b.intersects(box)); }

    * doodads() : IterableIterator<any> {
        yield ["signRight", new Point(-2, -2.5)];
        for(var box of this.boxes) {
            if (box.navi == "upl")  yield ['signLeft', new Point(box.x + box.w / 2, box.t + 0.5)];
            if (box.navi == "drop") yield ['boxItem', new Point(box.r - 0.6, box.t - 0.6)];
            for(var j = box.w * 2; j --> 0;)
		if (random() < 0.2)
		    yield [randarr(["bush", "grass", "rock", "grass", "bush", "grass", "rock", "mushroomBrown", "mushroomRed"]), new Point(box.x + 0.5 + random() * (box.w-1), box.t + 0.5)];
        }
        var sign = this.boxes[this.boxes.length-1].max;
        this.boxes.push(this.exit = new Box(sign.x-3, sign.y-1, 2, 3));
        yield ["signExit", {x:sign.x-1.5, y:sign.y+0.5}]
        yield ["doorClosed_mid", {x:sign.x-2.5, y:sign.y+0.5}]
        yield ["doorClosed_top", {x:sign.x-2.5, y:sign.y+1.5}]
    }
}
