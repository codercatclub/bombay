import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

export default {
  schema: {
  },
  init: function() {
    this.chihuahuaMesh = null;
    // on object3d set , lets get the chihuahua
    this.el.addEventListener('object3dset', () => {
        // Assign material to all child meshes
        this.el.object3D.traverse(child => {
          if (child.type === 'Mesh') {
            this.chihuahuaMesh = child;
          }
        });
      });
      this.moverComponent = document.querySelector('#camera').components.mover;
      this.tweenForward = new THREE.Vector3();
      this.nextMoveTime = 0.0;
      this.nextTarget = new THREE.Vector3();
      this.nextRotation = new THREE.Quaternion();
  },
  tick: function (time ,timeDelta) {
      if(!this.chihuahuaMesh) return;

        if(time > this.nextMoveTime){
            this.nextMoveTime = time + 3000.0*Math.random() + 1000.0;
            this.nextTarget.copy(this.moverComponent.lastCameraPosition)
            this.camForward = new THREE.Vector3();
            this.moverComponent.camera.getWorldDirection(this.camForward);
            this.camForward.y = 0.0;
            var mx = new THREE.Matrix4().lookAt(this.camForward,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
            this.nextRotation.setFromRotationMatrix(mx);
            this.nextRotation.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.PI/2,0)))

            this.nextTarget.add(this.camForward.clone().multiplyScalar(-5));
        }      
      
      this.tweenForward.lerp(this.nextTarget, 0.1);

      this.chihuahuaMesh.position.copy(this.tweenForward)

      this.chihuahuaMesh.quaternion.slerp(this.nextRotation, 0.1);
    //   this.chihuahuaMesh.position.add(this.tweenForward.normalize().multiplyScalar(-10));
      this.chihuahuaMesh.position.y = -0.5 + 0.25*Math.sin(0.02*time);
  }
};