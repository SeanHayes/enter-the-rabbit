(function($){

var camera, scene, renderer;
var geometry, material;
var app = {};

var DEGREES_TO_RAD = Math.PI/180;
var RAD_TO_DEGREES = 180/Math.PI;

$(document).ready(function(){
	app.init();
	app.animate();
});

//Camera should look to the origin by default, but later on may need to focus on specific objects
app.cameraTargetVector = new THREE.Vector3(0, 0, 0);
app.init = function(){
	// OrthographicCamera may conceivably render faster.
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.x = 500;
	camera.position.y = 500;
	camera.position.z = 500;
	camera.lookAt(app.cameraTargetVector);
	
	scene = new THREE.Scene();
	
	floor = new THREE.PlaneGeometry(1000, 1000);
	material = new THREE.MeshBasicMaterial({color: 0xdd3333, wireframe: false});
	var floorMesh = new THREE.Mesh(floor, material);
	floorMesh.rotation.x = -90*DEGREES_TO_RAD;
	
	scene.add(floorMesh);
	
	geometry = new THREE.CubeGeometry( 200, 200, 200 );
	material = new THREE.MeshFaceMaterial([
		new THREE.MeshBasicMaterial({color: 0x220022, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002222, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x222200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x220000, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x000022, wireframe: false}),
	]);
	
	
	scene.add(new THREE.Mesh(geometry, material));
	
	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	document.body.appendChild( renderer.domElement );
	
	// camera rotation
	$(renderer.domElement).mousedown(function(event){
		app.pageX = event.pageX;
		app.pageY = event.pageY;
		$(renderer.domElement).bind('mousemove', app.cameraRotate);
		
		$(renderer.domElement).unbind('mousewheel', app.cameraZoom);
	});
	// we bind to document since the mouse button might not be released over the canvas
	$(document).mouseup(function(event){
		$(renderer.domElement).unbind('mousemove', app.cameraRotate);
		app.pageX = null;
		app.pageY = null;
		
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