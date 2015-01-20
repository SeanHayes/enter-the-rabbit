var app = {},
    stats1,
    stats2;

(function($){

var camera, controls, scene, renderer, punchAni;

app.clickableObjects = [];
app.clickedObjects = [];

var animation = {
	name: "punch",
	length: 6000,
	fps: 30,
	hierarchy: [
		{parent:-1,keys:[{time:0,pos:[0,0,0],rot:[0,0,0,1],scl:[10,10,10]}]},
		{
			parent: 11,
			keys: [
				{
					time: 0,
//					pos: [ 0, 0, 0 ],
					rot: [ 0, 0, 0, 0 ],
//					scl:[10,10,10]
				},
				{
					time: 2000,
					rot: [ 90, 90, 0, 0 ],
//					scl:[10,10,10]
				},
				{
					time: 6000,
//					pos: [ 0, 0, 0 ],
					rot: [ 10, 10, 0, 0 ],
//					scl:[10,10,10]
				}
			]
		},
	]
}

// Begin Stats
stats1 = new Stats();
stats1.setMode(0);

stats2 = new Stats();
stats2.setMode(1);
// End Stats

$(document).ready(function(){
	document.body.appendChild( stats1.domElement );
	document.body.appendChild( stats2.domElement );
	
	app.init();
	requestAnimationFrame(app.animate, renderer.domElement);
});

// Camera should look to the origin by default, but later on may need to focus on specific objects
app.cameraTargetVector = new THREE.Vector3(0, 0, 0);
app.init = function(){
	app.world = tQuery.createWorld();
	
	scene = app.world._scene;
	renderer = app.world._renderer;
	
	document.body.appendChild( renderer.domElement );
	
	// Begin Camera Guide ------------------------------------------------------
	// helps orient user while rotating scene
	// TODO: when app.cameraTargetVector changes, this needs to be moved to the same location
	
	app.cameraGuide = getCameraGuide(renderer.domElement);
	scene.add(app.cameraGuide);
	
	app.cameraTargetVector = app.cameraGuide.position;
	// End Camera Guide
	
	// Begin Camera ------------------------------------------------------------
	camera = app.world._camera;//new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.x = 500;
	camera.position.y = 500;
	camera.position.z = 500;
	
	controls = new THREE.OrbitControls(camera);
	controls.target = app.cameraTargetVector
	controls.update();
	// End Camera
	
	$(renderer.domElement).mousedown(handleClick(camera, renderer, app.clickableObjects, function(event, intersects){
		console.debug(intersects);
		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];
			console.log('clicked on', intersect);
			app.clickedObjects.push(intersect);
			intersect.object.material._old_color = intersect.object.material.color.getHex();
			intersect.object.material.color.setHex( 0xeeeeff );

		}
	}));
	$(renderer.domElement).mouseup(function(){
		var intersect;
		while(intersect = app.clickedObjects.pop()){
			intersect.object.material.color.setHex(intersect.object.material._old_color);
		}
	});
	
	// Begin Floor -------------------------------------------------------------
	// what the other objects will appear on
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000);
	var floorMaterial = new THREE.MeshBasicMaterial({color: 0xdd3333, wireframe: false});
	var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -90*DEGREES_TO_RAD;
	floorMesh.clickable = true;
	scene.add(floorMesh);
	// End Floor
	
	// Begin Example Object ----------------------------------------------------
	/*var exGeometry = new THREE.CubeGeometry( 200, 200, 200 );
	var exMaterial = new THREE.MeshFaceMaterial([
		new THREE.MeshBasicMaterial({color: 0x220022, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002222, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x222200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x220000, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x000022, wireframe: false}),
	]);
	
	scene.add(new THREE.Mesh(exGeometry, exMaterial));*/
	// End Example Object
	
	// Begin Add Body ----------------------------------------------------------
	//var body1 = new rabbit.Body();
	
	//scene.add(body1);
	
	var loader = new THREE.JSONLoader();
	loader.load( "static/js/humanoid1.json", function( geometry, materials ) {
		var mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshNormalMaterial({transparent: true, opacity: 0.5, skinning: true}) );
		mesh.clickable = false;
		console.debug(mesh);
		
		var skelHelper = new THREE.SkeletonHelper(mesh);
		skelHelper.clickable = true;
		skelHelper.material = new THREE.LineBasicMaterial({color: 0x0000});
		skelHelper.material.linewidth = 3;
		
		mesh.scale.set( 10, 10, 10 );
		
		scene.add(mesh);
		scene.add(skelHelper);
		
		app.world._scene.traverseVisible(function(object){
			if (object.clickable){
				app.clickableObjects.push(object);
				object.traverseVisible(function(child){
					app.clickableObjects.push(child);
				});
			}
		});
		
		punchAni = new THREE.Animation(mesh, animation);
		punchAni.play();
	});
	// End Add Body
	
	// Change camera target
	$(renderer.domElement).dblclick(function(event){
		console.debug('dblclick');
	});
	
	if(!app.start){
		app.start = Date.now();
	}
}


app.animate = function(timeDelta){
	
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(app.animate, renderer.domElement);
	
	THREE.AnimationHandler.update(timeDelta);
	renderer.render( scene, camera );
	
	stats1.update();
	stats2.update();
}

})(jQuery);
