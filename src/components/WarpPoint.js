import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const WarpPoint = {
  schema: {
    exitWarpId: { type: 'string', default: 'warp1' },
    triggerRadius: {default: 3}
  },

  init: function () {
    this.exitWarpDiv = document.querySelector(`${this.data.exitWarpId}`);
    this.enterPoint = this.el.object3D.position;

    this.exitPoint = this.exitWarpDiv.object3D.position;

    const camera = document.querySelector("#camera");
    this.camera = camera.object3D;
    this.cameraWorldPos = new THREE.Vector3();
  },

  tick: function (time, timeDelta) {
    if(!this.enterPoint) return;
    if(!this.exitPoint) return;
    if(!this.moverComponent) {
      this.moverComponent = document.querySelector('#camera').components.mover;
      return;
    }

    this.camera.getWorldPosition(this.cameraWorldPos);
    let dist = this.cameraWorldPos.distanceTo(this.enterPoint);
    if(dist < this.data.triggerRadius)
    {
      this.moverComponent.Teleport(new THREE.Vector3(this.data.triggerRadius + 0.1,0,0).add(this.exitPoint), this.exitDir);
    }
  },
};

export default WarpPoint;
