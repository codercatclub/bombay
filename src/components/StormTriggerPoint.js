import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

export default {
  schema: {
    triggerRadius: {default: 4.5}
  },

  init: function () {
    this.enterPoint = this.el.object3D.position;

    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.cameraWorldPos = new THREE.Vector3();
    this.envSystem = this.el.sceneEl.systems["env-system"];
    this.timeInRoom = 0;
    this.left = false;
  },

  tick: function (time, timeDelta) {
    this.camera.getWorldPosition(this.cameraWorldPos);
    let dist = this.cameraWorldPos.distanceTo(this.enterPoint);
    if(dist > this.data.triggerRadius)
    {
        this.timeInRoom = 0.0;
        this.stillInRoom = false;
    } else {
        this.inRoom = true;
        this.timeInRoom += timeDelta;
    }

    if(this.timeInRoom > 3000 && !this.stillInRoom) {
        this.timeInRoom = 0.0;
        this.envSystem.toggleStorm();
        this.stillInRoom = true;
    }
  },
};

