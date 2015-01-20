
var DEGREES_TO_RAD = Math.PI/180;
var RAD_TO_DEGREES = 180/Math.PI;


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


var getCameraGuide = function(el){
	var geo = new THREE.CircleGeometry(200, 32),
	    lines = [
	        new THREE.Line(geo, new THREE.LineBasicMaterial({color: 0x0000ff})),
	        new THREE.Line(geo, new THREE.LineBasicMaterial({color: 0x00ff00})),
	        new THREE.Line(geo, new THREE.LineBasicMaterial({color: 0xff0000})),
	    ],
	    cameraGuide = new THREE.Object3D();
	
	lines[0].rotation.set(0, 0, 90*DEGREES_TO_RAD);
	lines[1].rotation.set(-90*DEGREES_TO_RAD, 0, 0);
	lines[2].rotation.set(0, -90*DEGREES_TO_RAD, 0);
	
	cameraGuide.add(lines[0]);
	cameraGuide.add(lines[1]);
	cameraGuide.add(lines[2]);
	
	cameraGuide.setVisible = function(visible){
		cameraGuide.traverse(function(obj){
			obj.visible = visible;
		});
	}
	
	cameraGuide.setVisible(false);
	
	$(el).mousedown(function(event){
		cameraGuide.setVisible(true);
	});
	$(document).mouseup(function(event){
		cameraGuide.setVisible(false);
	});
	return cameraGuide;
}

function handleClick(camera, renderer, clickableObjects, callback){
	
	var mouse = new THREE.Vector2();
	var raycaster = new THREE.Raycaster();
	
	return function(event){
		event.preventDefault();

		mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( clickableObjects );
		
		callback(event, intersects);
	}
}

