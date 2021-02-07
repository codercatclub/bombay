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
      this.material = this.el.components["ccbasic-material"];
      this.tweenForward = new THREE.Vector3();
      this.nextMoveTime = 0.0;
      this.nextTarget = new THREE.Vector3();
      this.nextRotation = new THREE.Quaternion();

      this.timeOfLastGlitch = 0;

      let glitchZoneNames = ["#tower"];
      this.glitchZones = [];

      glitchZoneNames.forEach((zone) => {
        let zoneObj = document.querySelector(zone);
        zoneObj.addEventListener('object3dset', () => {
          // Assign material to all child meshes
          zoneObj.object3D.traverse(child => {
            if (child.type === 'Mesh') {
              this.glitchZones.push(child);
              return;
            }
          });
        });
       
      });

  },

  updateGlitchState: function(time) {
    //two states
    if(this.glitching){
      //stop glitching in 4 seconds
      if(time > this.timeOfLastGlitch + 2000.0){
        this.material.materialShaders[0].uniforms.shouldGlitch.value = 0.0;
        this.glitching = false;
      }

    } else {

      this.glitchZones.forEach((zone) => {
        let dist = this.chihuahuaMesh.position.distanceTo(zone.position);
        if(dist < 9){
          this.timeOfLastGlitch = time;
          this.glitching = true;
        }
      })

      if(this.glitching) {
        setTimeout(() => {
          this.material.materialShaders[0].uniforms.shouldGlitch.value = 1.0;
        }, 1000)
      }

    }
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


      this.updateGlitchState(time);
  }
};