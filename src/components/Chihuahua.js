import AFRAME from 'aframe';
const THREE = AFRAME.THREE;
const CHIHUAHUA_STATES = {
  MOBIUS_CHILL: "mobiusChill",
  FOLLOW_MASTER: "followMaster",
}
export default {
  schema: {
  },
  init: function () {



    this.state = CHIHUAHUA_STATES.FOLLOW_MASTER;

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
    this.circleT = 0.0;
    this.nextSpinTime = 0.0;
    this.circleCenter = new THREE.Vector3();

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

  updateGlitchState: function (time) {
    //two states
    if (this.glitching) {
      //stop glitching in 4 seconds
      if (time > this.timeOfLastGlitch + 2000.0) {
        this.material.materialShaders[0].uniforms.shouldGlitch.value = 0.0;
        this.glitching = false;
      }

    } else {

      this.glitchZones.forEach((zone) => {
        let dist = this.chihuahuaMesh.position.distanceTo(zone.position);
        if (dist < 9) {
          this.timeOfLastGlitch = time;
          this.glitching = true;
        }
      })

      if (this.glitching) {
        setTimeout(() => {
          this.material.materialShaders[0].uniforms.shouldGlitch.value = 1.0;
        }, 1000)
      }

    }
  },

  lookRotation: function(forward, target) {
    var mx = new THREE.Matrix4().lookAt(forward, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    target.setFromRotationMatrix(mx);
    target.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)))
  },

  updateChihuahuaState: function (time, timeDelta) {
    switch (this.state) {
      case CHIHUAHUA_STATES.MOBIUS_CHILL: {
        if(this.circleT > 1.0) {
          this.nextSpinTime = time + 3000 + 2000.0 * Math.random();
          this.state = CHIHUAHUA_STATES.FOLLOW_MASTER;
        } else {
          this.circleT += 0.0007*timeDelta;
          let circlePos = new THREE.Vector3(1.5*Math.sin(2*Math.PI*this.circleT), 0, 1.5*Math.cos(2*Math.PI*this.circleT))
          this.nextTarget.copy(this.circleCenter).add(circlePos);

          let dir = new THREE.Vector3().subVectors(this.nextTarget,this.chihuahuaMesh.position);
          dir.y = 0.0;
          this.lookRotation(dir.normalize(), this.nextRotation);
        }
        break;
      }
      case CHIHUAHUA_STATES.FOLLOW_MASTER: {
        if (time > this.nextMoveTime) {
          this.nextMoveTime = time + 3000.0 * Math.random() + 1000.0;
          this.nextTarget.copy(this.moverComponent.lastCameraPosition)
          this.camForward = new THREE.Vector3();
          this.moverComponent.camera.getWorldDirection(this.camForward);
          this.camForward.y = 0.0;
          this.lookRotation(this.camForward, this.nextRotation);

          this.nextTarget.add(this.camForward.clone().multiplyScalar(-5));
        }

        if(time > this.nextSpinTime) {
          this.state = CHIHUAHUA_STATES.MOBIUS_CHILL;
          this.circleT = 0.0;
          this.circleCenter.copy(this.chihuahuaMesh.position);
          if(this.barkSound) {
            this.barkSound.playSound();
          }
        }

        break;
      }
    }
  },

  tick: function (time, timeDelta) {
    if (!this.chihuahuaMesh) return;

    //sets the next target
    this.updateChihuahuaState(time,timeDelta);
    this.updateGlitchState(time);


    this.tweenForward.lerp(this.nextTarget, 0.1);
    this.chihuahuaMesh.position.copy(this.tweenForward)
    this.chihuahuaMesh.quaternion.slerp(this.nextRotation, 0.1);
    this.chihuahuaMesh.position.y = -0.5 + 0.25 * Math.sin(0.02 * time);
    if(!this.barkSound) {
      this.barkSound = document.querySelector('#dog-bark').components["sound"];
    } else {
      this.barkSound.el.object3D.position.copy(this.chihuahuaMesh.position);
    }
  }
};