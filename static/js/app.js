(function($){

var camera, scene, renderer;
var geometry, material;
var app = {};

var DEGREES_TO_RAD = Math.PI/180;

$(document).ready(function(){
	app.init();
	app.animate();
});

app.cameraTargetVector = new THREE.Vector3(0, 0, 0);
app.init = function(){
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
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
	console.debug(floorMesh, floor, material);
	
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
	var mouseDiffX = app.pageX - event.pageX;
	var mouseDiffY = app.pageY - event.pageY;
	
	app.pageX = event.pageX;
	app.pageY = event.pageY;
	
	var vector = new THREE.Vector3()
	vector.sub(camera.position, app.cameraTargetVector);
	
	var m = new THREE.Matrix4();
	m.rotateY(mouseDiffX * DEGREES_TO_RAD);
	//this probably isn't quite right but will work for now
	//also, need to reverse direction when rotated around Y axis
	m.rotateX(mouseDiffY * DEGREES_TO_RAD);
	m.multiplyVector3(vector);
	
	camera.position.add(app.cameraTargetVector, vector);
	
	camera.lookAt(app.cameraTargetVector);
}
app.cameraZoom = function(event, delta, deltaX, deltaY){
	//console.debug(event, delta, deltaX, deltaY);
	var vector = new THREE.Vector3(),
	    step = deltaY * 10;
	
	vector.sub(camera.position, app.cameraTargetVector);
	
	var m = new THREE.Matrix4(),
	    transVector = new THREE.Vector3(step, step, step);
	
	//needed for when coordinates are negative
	if(vector.x < 0) transVector.x *= -1
	if(vector.y < 0) transVector.y *= -1
	if(vector.z < 0) transVector.z *= -1
	
	m.translate(transVector);
	m.multiplyVector3(vector);
	
	camera.position.add(app.cameraTargetVector, vector);
}

app.animate = function(){
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(app.animate);

	renderer.render( scene, camera );
}


})(jQuery);
