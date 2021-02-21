import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const Dome = {
  schema: {
    triggerRadius: {default: 10}
  },
  init: function () {

    let planeGeo = new THREE.PlaneGeometry(8,8);
    let tempMat = new THREE.MeshBasicMaterial();

    this.rootObj = new THREE.Object3D();

    const t = ( 1 + Math.sqrt( 5 ) ) / 2;

		const vertices = [
			- 1, t, 0, 	1, t, 0, 	- 1, - t, 0, 	1, - t, 0,
			0, - 1, t, 	0, 1, t,	0, - 1, - t, 	0, 1, - t,
			t, 0, - 1, 	t, 0, 1, 	- t, 0, - 1, 	- t, 0, 1
		];

		const indices = [
			0, 11, 5,  0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
			1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
			3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
			4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
		];

    for(let i = 0; i < indices.length; i +=3) {
      let idx1 = indices[i] 
      let idx2 = indices[i+1] 
      let idx3 = indices[i+2]

      let vector1 = new THREE.Vector3(vertices[3*idx1], vertices[3*idx1+1], vertices[3*idx1+2])
      let vector2 = new THREE.Vector3(vertices[3*idx2], vertices[3*idx2+1], vertices[3*idx2+2])
      let vector3 = new THREE.Vector3(vertices[3*idx3], vertices[3*idx3+1], vertices[3*idx3+2])
      
      let avgPos = vector1.add(vector2).add(vector3)
      avgPos.multiplyScalar(2.4)

      let mesh = new THREE.Mesh(planeGeo, tempMat);
      mesh.position.copy(avgPos)

      let forward = avgPos.normalize();

      var mx = new THREE.Matrix4().lookAt(forward, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
      mesh.quaternion.setFromRotationMatrix(mx);

      this.rootObj.add(mesh)
    }

    this.el.setObject3D("mesh", this.rootObj);
    
    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.cameraWorldPos = new THREE.Vector3();

    this.skyLerp = 0.0;
  },
  
  tick: function (time, timeDelta) {

    this.camera.getWorldPosition(this.cameraWorldPos);
    let dist = this.cameraWorldPos.distanceTo(this.el.object3D.position);
    if(dist < this.data.triggerRadius)
    {
      this.skyLerp = Math.min(this.skyLerp + 0.0004*timeDelta, 0.999)
    } else {
      this.skyLerp = Math.max(this.skyLerp - 0.0008*timeDelta, 0.0)
    }
    if(this.sky){
      this.sky.skyMaterial.uniforms.blockSizeMult.value = this.skyLerp;
    } else {
      this.sky = document.querySelector('#sky').components["sky-material"]
    }

    this.rootObj.rotation.y += 0.0001*timeDelta;
    this.rootObj.rotation.x += 0.00005*timeDelta;
  },
};

export default Dome;
