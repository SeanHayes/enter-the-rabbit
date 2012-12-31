var rabbit = {};

(function(){


rabbit.Body = function(){
	THREE.Object3D.call(this);
	
	var bodyMaterials = [
		//new THREE.MeshBasicMaterial({color: 0x082020, wireframe: false});
		new THREE.MeshBasicMaterial({color: 0x220022, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002222, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x222200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x220000, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x002200, wireframe: false}),
		new THREE.MeshBasicMaterial({color: 0x000022, wireframe: false}),
	]
	
	var hipsMesh = new THREE.Mesh(new rabbit.Hips(), bodyMaterials[0]);
	hipsMesh.scale.z = 0.75;
	hipsMesh.position.y = 77+7;
	
	this.add(hipsMesh);
	
	var abdomenMesh = new THREE.Mesh(new rabbit.Abdomen(), bodyMaterials[1]);
	abdomenMesh.scale.z = 0.75;
	abdomenMesh.position.y = 77+14+6;
	
	this.add(abdomenMesh);
	
	var chestMesh = new THREE.Mesh(new rabbit.Chest(), bodyMaterials[2]);
	console.debug(chestMesh);
	chestMesh.scale.z = 0.75;
	chestMesh.position.y = 77+26+13;
	
	this.add(chestMesh);
	
	var rightThighMesh = new THREE.Mesh(new rabbit.Thigh(), bodyMaterials[3]);
	rightThighMesh.position.x = -7.5;
	rightThighMesh.position.y = 44+24;
	
	this.add(rightThighMesh);
	
	var leftThighMesh = new THREE.Mesh(new rabbit.Thigh(), bodyMaterials[3]);
	leftThighMesh.position.x = 7.5;
	leftThighMesh.position.y = 44+24;
	
	this.add(leftThighMesh);
	
	
	var rightCrusMesh = new THREE.Mesh(new rabbit.Crus(), bodyMaterials[4]);
	rightCrusMesh.position.x = -7.5;
	rightCrusMesh.position.y = 20+8;
	
	this.add(rightCrusMesh);
	
	var leftCrusMesh = new THREE.Mesh(new rabbit.Crus(), bodyMaterials[4]);
	leftCrusMesh.position.x = 7.5;
	leftCrusMesh.position.y = 20+8;
	
	this.add(leftCrusMesh);
	
}
rabbit.Body.prototype = Object.create(THREE.Object3D.prototype);


rabbit.Chest = function(){
	THREE.CylinderGeometry.call(this, 15, 13, 26);
}
rabbit.Chest.prototype = Object.create(THREE.CylinderGeometry.prototype);

rabbit.Abdomen = function(){
	THREE.CylinderGeometry.call(this, 13, 15, 12);
}
rabbit.Abdomen.prototype = Object.create(THREE.CylinderGeometry.prototype);

rabbit.Hips = function(){
	THREE.CylinderGeometry.call(this, 15, 12, 14);
}
rabbit.Hips.prototype = Object.create(THREE.CylinderGeometry.prototype);

rabbit.Thigh = function(){
	THREE.CylinderGeometry.call(this, 7.5, 5, 44);
}
rabbit.Thigh.prototype = Object.create(THREE.CylinderGeometry.prototype);


rabbit.Crus = function(){
	THREE.CylinderGeometry.call(this, 5, 3.5, 40);
}
rabbit.Crus.prototype = Object.create(THREE.CylinderGeometry.prototype);

})();
