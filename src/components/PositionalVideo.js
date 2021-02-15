import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

/** Play video base on player distance to the object */
export default {
  schema: {
    triggerRadius: { default: 5 },
  },

  init: function () {
    const videoElementID = this.el.components.material.attrValue.src
    
    this.videoEl = document.querySelector(videoElementID);
    
    const camera = document.querySelector("#camera");
    
    this.camera = camera.object3D;
    this.cameraWorldPos = new THREE.Vector3();
  },

  tick: function () {
    this.camera.getWorldPosition(this.cameraWorldPos);
    let dist = this.cameraWorldPos.distanceTo(this.el.object3D.position);

    if (dist > this.data.triggerRadius) {
      this.videoEl.pause();
      this.videoEl.muted = true;
    } else {
      this.videoEl.play();
      this.videoEl.muted = false;
    }
  }
};
