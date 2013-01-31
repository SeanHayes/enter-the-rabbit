var app = {},
    stats1,
    stats2;

(function($){

var camera, scene, renderer;

var DEGREES_TO_RAD = Math.PI/180;
var RAD_TO_DEGREES = 180/Math.PI;

// Begin Stats
stats1 = new Stats();
stats1.setMode(0);
stats1.domElement.style.position = 'absolute';
stats1.domElement.style.left = '0px';
stats1.domElement.style.top = '0px';

stats2 = new Stats();
stats2.setMode(1);
stats2.domElement.style.position = 'absolute';
stats2.domElement.style.left = '0px';
stats2.domElement.style.top = '50px';
// End Stats

$(document).ready(function(){
	document.body.appendChild( stats1.domElement );
	document.body.appendChild( stats2.domElement );
	
	app.init();
	app.animate();
});

//Camera should look to the origin by default, but later on may need to focus on specific objects
app.cameraTargetVector = new THREE.Vector3(0, 0, 0);
app.setCameraGuideVisibility = function(visible){
	app.cameraGuide.traverse(function(obj){
		obj.visible = visible;
	});
}
app.init = function(){
	app.world = tQuery.createWorld();
	
	scene = app.world._scene;
	renderer = app.world._renderer;
	
	document.body.appendChild( renderer.domElement );
	
	// Begin Camera ------------------------------------------------------------
	camera = app.world._camera;//new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.x = 500;
	camera.position.y = 500;
	camera.position.z = 500;
	camera.lookAt(app.cameraTargetVector);
	// End Camera
	
	
	// Begin Camera Guide ------------------------------------------------------
	// helps orient user while rotating scene
	// TODO: when app.cameraTargetVector changes, this needs to be moved to the same location
	var cameraGuideGeo = new THREE.CircleGeometry(200, 32),
	    cameraGuideLines = [
	        new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0x0000ff})),
	        new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0x00ff00})),
	        new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0xff0000})),
	    ];
	
	cameraGuideLines[0].rotation = new THREE.Vector3(0, 0, 90*DEGREES_TO_RAD);
	cameraGuideLines[1].rotation = new THREE.Vector3(-90*DEGREES_TO_RAD, 0, 0);
	cameraGuideLines[2].rotation = new THREE.Vector3(0, -90*DEGREES_TO_RAD, 0);
	
	app.cameraGuide = new THREE.Object3D();
	app.cameraGuide.add(cameraGuideLines[0])
	app.cameraGuide.add(cameraGuideLines[1])
	app.cameraGuide.add(cameraGuideLines[2]);
	scene.add(app.cameraGuide);
	app.setCameraGuideVisibility(false);
	// End Camera Guide
	
	
	// Begin Floor -------------------------------------------------------------
	// what the other objects will appear on
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000);
	var floorMaterial = new THREE.MeshBasicMaterial({color: 0xdd3333, wireframe: false});
	var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -90*DEGREES_TO_RAD;
	
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
	loader.load( "static/js/humanoid1.json", function( geometry ) {
		var mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
		mesh.scale.set( 10, 10, 10 );
		scene.add(mesh);
		console.debug(mesh);
	});
	// End Add Body
	
	// camera rotation
	$(renderer.domElement).mousedown(function(event){
		app.pageX = event.pageX;
		app.pageY = event.pageY;
		$(renderer.domElement).bind('mousemove', app.cameraRotate);
		app.setCameraGuideVisibility(true);
		
		$(renderer.domElement).unbind('mousewheel', app.cameraZoom);
	});
	// we bind to document since the mouse button might not be released over the canvas
	$(document).mouseup(function(event){
		$(renderer.domElement).unbind('mousemove', app.cameraRotate);
		app.pageX = null;
		app.pageY = null;
		app.setCameraGuideVisibility(false);
		
		$(renderer.domElement).bind('mousewheel', app.cameraZoom);
	});
	$(renderer.domElement).bind('mousewheel', app.cameraZoom);
}

app.cameraRotate = function(event){
	//TODO: it would be great if we ensured we only computed this stuff at most once per frame
	var mouseDiffX = app.pageX - event.pageX;
	var mouseDiffY = app.pageY - event.pageY;
	
	app.pageX = event.pageX;
	app.pageY = event.pageY;
	
	var vector = new THREE.Vector3();
	vector.sub(camera.position, app.cameraTargetVector);
	
	var radius = vector.length(), x, y, z;
	
	var theta, phi;
	theta = Math.acos(vector.y/radius) + (mouseDiffY * DEGREES_TO_RAD);
	phi = Math.atan2(vector.x, vector.z) + (mouseDiffX * DEGREES_TO_RAD);
	
	// Disallow negative degree inclination. It doesn't cause any serious
	// problems but the camera is sort of jittery. Can't set the value to 0
	// since the camera rotation gets reset, so we set it to 1 degree instead.
	// This problem doesn't seem to  happen at 180 degrees.
	if (theta < 0){theta = 0}
	else if(theta > Math.PI){theta = Math.PI}
	
	vector.z = radius * Math.sin(theta) * Math.cos(phi);
	vector.x = radius * Math.sin(theta) * Math.sin(phi);
	vector.y = radius * Math.cos(theta);
	
	camera.position.add(app.cameraTargetVector, vector);
	
	camera.lookAt(app.cameraTargetVector);
}
app.cameraZoom = function(event, delta, deltaX, deltaY){
	var vector = new THREE.Vector3(),
	    stepPercentage = 1 - deltaY / 20;
	
	vector.sub(camera.position, app.cameraTargetVector);
	vector.x *= stepPercentage;
	vector.y *= stepPercentage;
	vector.z *= stepPercentage;
	
	camera.position.add(app.cameraTargetVector, vector);
}

app.animate = function(timestamp){
	stats1.begin();
	stats2.begin();
	
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(app.animate, renderer.domElement);
	
	renderer.render( scene, camera );
	
	stats1.end();
	stats2.end();
}

})(jQuery);
