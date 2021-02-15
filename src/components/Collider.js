import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

const Collider = {
  init: function () {

    this.moverComponent = document.querySelector("#camera").components.mover;

    this.el.addEventListener('object3dset', (evt) => {
      this.el.object3D.traverse((child) => {
        if (child.type === "Mesh" && child.name == "collider") {
          child.visible = false;
          this.moverComponent.terrain.add(child);
        }
      });
    });

  }
};

export default Collider;
