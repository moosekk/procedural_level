"use strict";

class Player {
    boxes: any;
    constructor(scene, attrs) {
        for(var a in attrs || {}) this[a] = attrs[a];
        this.boxes = scene.objects.map(x => x.bounds);
    }
}

window['gameobjects'] = new Level();
var player = new Player(window['gameobjects'], null);
