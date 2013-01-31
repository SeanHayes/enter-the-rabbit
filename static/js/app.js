var app = {},
    stats1,
    stats2;

(function($){

var camera, scene, renderer;

var DEGREES_TO_RAD = Math.PI/180;
var RAD_TO_DEGREES = 180/Math.PI;

var animation = {
	name: "punch",
	length: 6000,
	fps: 0.03,  // fpms actually
	hierarchy: [
		{
		parent: 11,
		keys: [
			{
				time: 0,
				pos: [ 0, 0, 0 ],
				rot: [ 0, 0, 0, 0 ],
				scl: [ 10, 10, 10 ]
			},
			{
				time: 2000,
				rot: [ 5, 5, 0, 0 ]
			},
			{
				time: 6000,
				pos: [ 0, 0, 0 ],
				rot: [ 10, 10, 0, 0 ],
				scl: [ 10, 10, 10 ]
			}
		]
		},
	]
}
THREE.AnimationHandler.add(animation);

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
	requestAnimationFrame(app.animate, renderer.domElement);
});

function rotateVector(v, phiDegrees, thetaDegrees, fix){
	v = v.clone();
	var radius = v.length(),
	    theta = Math.acos(v.y/radius) + (thetaDegrees * DEGREES_TO_RAD),
	    phi   = Math.atan2(v.x, v.z) + (phiDegrees * DEGREES_TO_RAD);
	
	// Disallow negative degree inclination. It doesn't cause any serious
	// problems but the camera is sort of jittery. Can't set the value to 0
	// since the camera rotation gets reset, so we set it to >0 degrees instead.
	// This problem doesn't seem to happen at 180 degrees.
	if (fix){
		if (theta <= 0){theta = 0.1*DEGREES_TO_RAD}
		else if(theta > Math.PI){theta = Math.PI}
	}
	
	v.z = radius * Math.sin(theta) * Math.cos(phi);
	v.x = radius * Math.sin(theta) * Math.sin(phi);
	v.y = radius * Math.cos(theta);
	
	return v
}

//Camera should look to the origin by default, but later on may need to focus on specific objects
app.cameraCurrentActions = {
	rotating: false,
	panning: false,
}
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
	
	app.cameraTargetVector = app.cameraGuide.position;
	// End Camera Guide
	
	// Begin Camera ------------------------------------------------------------
	camera = app.world._camera;//new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.x = 500;
	camera.position.y = 500;
	camera.position.z = 500;
	camera.lookAt(app.cameraTargetVector);
	// End Camera
	
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
		
		//var punchAni = new THREE.Animation(mesh, 'punch');
		//punchAni.play(false);
		console.debug(mesh);
	});
	// End Add Body
	
	// Set Up Input Event Handlers
	$(renderer.domElement).mousemove(function(e){
		window.pageX = e.pageX;
		window.pageY = e.pageY;
	});
	
	// camera rotation
	$(renderer.domElement).mousedown(function(event){
		var actions = app.cameraCurrentActions;
		
		switch(event.which){
			case 1:
				actions.rotating = true;
				//$(renderer.domElement).bind('mousemove', app.cameraRotate);
				break;
			case 2:
				actions.panning = true;
				//$(renderer.domElement).bind('mousemove', app.cameraPan);
				break;
		}
		
		if(actions.rotating || actions.panning)
			app.setCameraGuideVisibility(true);
		
		$(renderer.domElement).unbind('mousewheel', app.cameraZoom);
	});
	// we bind to document since the mouse button might not be released over the canvas
	$(document).mouseup(function(event){
		var actions = app.cameraCurrentActions;
		
		switch(event.which){
			case 1:
				actions.rotating = false;
				break;
			case 2:
				actions.panning = false;
				break;
		}
		
		if(!actions.rotating && !actions.panning)
			app.setCameraGuideVisibility(false);
		
		$(renderer.domElement).bind('mousewheel', app.cameraZoom);
	});
	
	// Zoom
	$(renderer.domElement).bind('mousewheel', app.cameraZoom);
	
	// Change camera target
	$(renderer.domElement).dblclick(function(event){
		console.debug('dblclick');
	});
}

app.cameraRotate = function(event){
	//TODO: it would be great if we ensured we only computed this stuff at most once per frame
	var mouseDiffX = app.pageX - event.pageX;
	var mouseDiffY = app.pageY - event.pageY;
	
	var vector = new THREE.Vector3();
	vector.subVectors(camera.position, app.cameraTargetVector);
	
	vector = rotateVector(vector, mouseDiffX, mouseDiffY, true);
	
	camera.position.addVectors(app.cameraTargetVector, vector);
	
	camera.lookAt(app.cameraTargetVector);
}
app.cameraPan = function(event){
	//TODO: it would be great if we ensured we only computed this stuff at most once per frame
	var mouseDiffX = app.pageX - event.pageX;
	var mouseDiffY = app.pageY - event.pageY;
	
	//get copies of this vector rotated 90 degrees,
	//normalize these copies to the mouseDiffX and mouseDiffY
	//add the
	var v = new THREE.Vector3();
	v.subVectors(app.cameraTargetVector, camera.position);
	
	var hVector = rotateVector(v, -90, 0),
	    vVector = rotateVector(v, 0, 90);
	
	hVector.setLength(mouseDiffX);
	vVector.setLength(mouseDiffY);
	
	camera.position.add(hVector);
	camera.position.add(vVector);
	app.cameraTargetVector.add(hVector);
	app.cameraTargetVector.add(vVector);
	
	camera.lookAt(app.cameraTargetVector);
}
app.cameraZoom = function(event, delta, deltaX, deltaY){
	var vector = new THREE.Vector3(),
	    stepPercentage = 1 - deltaY / 20;
	
	vector.subVectors(camera.position, app.cameraTargetVector);
	vector.x *= stepPercentage;
	vector.y *= stepPercentage;
	vector.z *= stepPercentage;
	
	camera.position.addVectors(app.cameraTargetVector, vector);
}

app.animate = function(timestamp){
	if(!app.start){
		app.start = Date.now();
	}
	
	stats1.begin();
	stats2.begin();
	
	// handle events once per frame
	var event = {
		pageX: window.pageX,
		pageY: window.pageY,
	};
	if (app.cameraCurrentActions.rotating){
		app.cameraRotate(event);
	}
	if (app.cameraCurrentActions.panning){
		app.cameraPan(event);
	}
	
	app.pageX = window.pageX;
	app.pageY = window.pageY;
	// end handle events
	
	var progress = timestamp-app.start;
	
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(app.animate, renderer.domElement);
	
	THREE.AnimationHandler.update(progress);
	renderer.render( scene, camera );
	
	stats1.end();
	stats2.end();
}

})(jQuery);
