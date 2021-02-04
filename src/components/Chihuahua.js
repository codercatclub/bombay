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
            this.nextMoveTime = time + 5000.0*Math.random() + 2000.0;
            this.nextTarget.copy(this.moverComponent.lastCameraPosition)
            this.nextTarget.add(this.moverComponent.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-5));
            this.moverComponent.camera.getWorldQuaternion(this.nextRotation)
            this.nextRotation.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.PI/2,0)))
        }      
      
      this.tweenForward.lerp(this.nextTarget, 0.1);

      this.chihuahuaMesh.position.copy(this.tweenForward)

      this.chihuahuaMesh.quaternion.slerp(this.nextRotation, 0.1);
    //   this.chihuahuaMesh.position.add(this.tweenForward.normalize().multiplyScalar(-10));
      this.chihuahuaMesh.position.y = -0.5 + 0.25*Math.sin(0.02*time);
  }
};