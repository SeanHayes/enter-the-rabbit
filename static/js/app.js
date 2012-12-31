var app = {};

(function($){

var camera, scene, renderer;

var DEGREES_TO_RAD = Math.PI/180;
var RAD_TO_DEGREES = 180/Math.PI;

$(document).ready(function(){
	app.init();
	app.animate();
});

//Camera should look to the origin by default, but later on may need to focus on specific objects
app.cameraTargetVector = new THREE.Vector3(0, 0, 0);
app.cameraGuideLines = [];
app.setCameraGuideVisibility = function(visible){
	app.cameraGuideLines[0].visible = visible;
	app.cameraGuideLines[1].visible = visible;
	app.cameraGuideLines[2].visible = visible;
}
app.init = function(){
	scene = new THREE.Scene();
	
	// Begin Camera ------------------------------------------------------------
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.x = 500;
	camera.position.y = 500;
	camera.position.z = 500;
	camera.lookAt(app.cameraTargetVector);
	// End Camera
	
	
	// Begin Camera Guide ------------------------------------------------------
	// helps orient user while rotating scene
	// TODO: when app.cameraTargetVector changes, this needs to be moved to the same location
	var cameraGuideGeo = new THREE.CircleGeometry(200, 32);
	
	app.cameraGuideLines.push(new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0x0000ff})));
	app.cameraGuideLines.push(new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0x00ff00})));
	app.cameraGuideLines.push(new THREE.Line(cameraGuideGeo, new THREE.LineBasicMaterial({color: 0xff0000})));
	
	app.cameraGuideLines[0].rotation = new THREE.Vector3(0, 0, 90*DEGREES_TO_RAD);
	app.cameraGuideLines[1].rotation = new THREE.Vector3(-90*DEGREES_TO_RAD, 0, 0);
	app.cameraGuideLines[2].rotation = new THREE.Vector3(0, -90*DEGREES_TO_RAD, 0);
	
	app.setCameraGuideVisibility(false);
	
	scene.add(app.cameraGuideLines[0]);
	scene.add(app.cameraGuideLines[1]);
	scene.add(app.cameraGuideLines[2]);
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
	var body1 = new rabbit.Body();
	
	scene.add(body1);
	// End Add Body
	
	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	document.body.appendChild( renderer.domElement );
	
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

app.animate = function(){
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(app.animate);
	
	renderer.render( scene, camera );
}

})(jQuery);
