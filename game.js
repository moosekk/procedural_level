var player, scene, global_camera, background;

boxmat = new THREE.MeshBasicMaterial()
var tl = new THREE.TextureLoader();
var stonetex = tl.load("sprites/PNG/Ground/Grass/grass.png");


var keyboard = new (function KeyboardInput() {
    this.state = {};
    var that = this;
    function onKeyDown(e) { that.state[e.keyCode] = 1; }
    function onKeyUp(e) { that.state[e.keyCode] = 0; }
    document.body.addEventListener("keydown", e => onKeyDown.call(that, e));
    document.body.addEventListener("keyup", e => onKeyUp.call(that, e));
})();
var gamescene = new Level();
var player = new Player(gamescene, keyboard);

function addBlock(box, color) {
    var tex = tl.load("sprites/PNG/Ground/Grass/grassMid.png");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(box.w, box.h);
    tex.needsUpdate = true;
    var m = new THREE.SpriteMaterial({map: tex})
    var s = new THREE.Sprite(m);
    s.position.set(box.center().x, box.center().y, 0);
    s.scale.set(box.w, box.h, 0)
    scene.add(s);
}

function addDoodad(data) {
    var pos = data[1];
    var tex = tl.load("sprites/PNG/Tiles/" + data[0] + ".png");
    var m = new THREE.SpriteMaterial({map: tex})
    var s = new THREE.Sprite(m);
    s.position.set(pos.x, pos.y, 0.1)
    scene.add(s);
}

function addLine(start, end, type) {
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3(start.x, start.y, 0.01))
    g.vertices.push(new THREE.Vector3(end.x, end.y, 0.01))
    var s = new THREE.Line(g, new THREE.LineBasicMaterial({ color: type || 0xffffff }));
    scene.add(s);
    addBlock(new Box(end.x, end.y, 0.3, 0.3), type || 0xffffff);
}

function init(cv) {
    scene = new THREE.Scene()

    var cw = 10;
    camera = new THREE.OrthographicCamera(-cw, cw, cw, -cw, 1, 100);
    camera.position.set(0, 0, 30)
    global_camera = new THREE.OrthographicCamera(-gamescene.height * 0.6, gamescene.height * 0.6, gamescene.height * 0.6, -gamescene.height * 0.6, 1, 100);
    global_camera.position.set(0, 0, 30)

    var light = new THREE.DirectionalLight(0xffffff, 100)
    light.position.set(-1, 3, 2)
    scene.add(light)

    gamescene.objects.map(function(o) { addBlock(o.bounds); });
    for(var d of gamescene.doodads()) addDoodad(d);
    background = new THREE.Sprite();
    background.material.map = tl.load("sprites/PNG/Backgrounds/blue_grass.png");
    background.scale.set(20, 20, 20);
    scene.add(background);
    var sprite = new THREE.Sprite();
    sprite.material.map = tl.load("sprites/PNG/Players/128x256/Pink/alienPink_stand.png");
    sprite.scale.set(1, 2, 1);
    sprite.position = player.position;

    player.sprite = sprite;
    scene.add(sprite);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(600, 600)
    renderer.setClearColor(0xc2eeee)
    container.appendChild(renderer.domElement)
}

function update() {
    player.update();
    var p = player.position;
    player.sprite.position.set(p.x, p.y, p.z);
    background.position.set(p.x, p.y * 0.7, -1);
    camera.position.set(p.x, p.y, 30);
    global_camera.position.set(p.x, p.y, 30);
}
setInterval(update, 20);
function render(t) {
    requestAnimationFrame(render);
    renderer.render(scene, keyboard.state["1".charCodeAt(0)] ? global_camera : camera)
}
