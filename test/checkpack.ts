import 'pixi.js';
import '../dist/pixi-tilemap.js';
import ResourceDictionary = PIXI.loaders.ResourceDictionary;
import Loader = PIXI.loaders.Loader;

//@../node_modules/pixi.js/dist/pixi.min.js
//@../dist/pixi-tilemap.js

var app = new PIXI.Application(800, 600);
var renderer = app.renderer;
document.body.appendChild(renderer.view);

var stage: PIXI.Container, tilemap: PIXI.tilemap.CompositeRectTileLayer;

var loader = new PIXI.loaders.Loader();
loader.add('atlas', 'basic/atlas.json');
loader.add('button', 'basic/button.png');
loader.load(function(loader: PIXI.loaders.Loader, resources: any) {
	//first parameter means z-layer, which is not used yet
	//second parameter is list of textures for layers
	//third parameter means that all our tiles are squares or at least 2x1 dominoes
	//   and we can optimize it with gl.POINTS
	stage = new PIXI.Container();
	tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, []);
	stage.addChild(tilemap);

	var frame = 0;
	buildTilemap(frame++);

	var pic = new PIXI.Sprite(resources['button'].texture);
	pic.position.set(200, 100);
	stage.addChild(pic);
	//lets animate tilemap every second
	//setInterval(function() { buildTilemap(frame++) }, 400);
});

function buildTilemap(frame: number) {
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

