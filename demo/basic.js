var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

var stage, tilemap;

var loader = new PIXI.loaders.Loader();
loader.add('atlas', 'basic/atlas.json');
loader.add('button', 'basic/button.png');
loader.load(function(loader, resources) {
    //first parameter means z-layer, which is not used yet
    //second parameter is list of textures for layers
    stage = new PIXI.Container();
	tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, [resources['atlas_image'].texture]);
	stage.addChild(tilemap);

    animate();

    var frame = 0;
    buildTilemap(frame++);

    var pic = new PIXI.Sprite(resources['button'].texture);
    pic.position.set(200, 100);
    stage.addChild(pic);
    //lets animate tilemap every second
    setInterval(function() { buildTilemap(frame++) }, 400);
});

function buildTilemap(frame) {
    //Clear everything, like a PIXI.Graphics
    tilemap.clear();
    var resources = loader.resources;

    var size = 32;
    // if you are too lazy, just specify filename and pixi will find it in cache
    for (var i=0;i<7;i++)
        for (var j=0;j<7;j++) {
            tilemap.addFrame("grass.png", i*size, j*size);
            if (i%2==1 && j%2==1)
                tilemap.addFrame("tough.png", i*size, j*size);
        }

    // if you are lawful citizen, please use textures from
    var textures = resources.atlas.textures;
    tilemap.addFrame(textures["brick.png"], 2*size, 2*size);
    tilemap.addFrame(textures["brick_wall.png"], 2*size, 3*size);

    //chest will be animated!
    tilemap.addFrame(textures[frame%2==0 ? "chest.png": "red_chest.png"], 4*size, 4*size);

    // button does not appear in the atlas, but tilemap wont surrender, it will create second layer for special for buttons
    // buttons will appear above everything
    tilemap.addFrame(resources.button.texture, 6*size, 2*size);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}
