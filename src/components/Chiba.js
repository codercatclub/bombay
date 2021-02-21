import AFRAME from 'aframe';

const THREE = AFRAME.THREE;
import { doRoutine } from "../Utils";

const Chiba = {
  schema: {
    chiba1: { type: "string", default: "chiba2" },
    chiba2: { type: "string", default: "chiba3" },
    chiba3: { type: "string", default: "chiba4" },
    finalChiba: { type: "string", default: "chiba0" },
    finalChibaBack: { type: "string", default: "chiba0Background" },
  },
  init: function () {
    //chiba system, checks if you have looked at all 4 chibas for at least 3 seconds. if you have, 
    //then the final chiba will emerge and start following you
    this.chibas = [this.data.chiba1, this.data.chiba2, this.data.chiba3]
    this.chibaEls = []
    this.activateFinalChiba = false;
    this.chibas.forEach((c) => {
      // when it's object 3d is set 
      const el = document.querySelector(`#${c}`);
      this.chibaEls.push({
        el: el,
        pVid: null,
        done: false
      })
    })

    this.finalChiba = document.querySelector(`#${this.data.finalChiba}`);
    this.finalChibaBack = document.querySelector(`#${this.data.finalChibaBack}`);
    this.moverComponent = document.querySelector('#camera').components.mover;

    
    this.activateCoroutine = function* () {
      document.querySelector('#chibaActivationSound').components["sound"].playSound()

      let obj3D = this.finalChiba.object3D;
      let obj3D2 = this.finalChibaBack.object3D;
      let mat = this.finalChiba.components["ccbasic-material"];
      obj3D.position.y = -5;
      obj3D2.position.y = -5;
      let t = 0;
      while (t <= 1) {
        mat.materialShaders[0].uniforms.posterize.value = 1 + 7 * t
        mat.materialShaders[0].uniforms.voxelSize.value = 3.0 - 3.0*t
        t += this.deltaTimeSec/10.66;
        obj3D.position.y = -5 + 10 * t;
        obj3D2.position.y = -5 + 10 * t;
        yield;
      }
      mat.materialShaders[0].uniforms.voxelSize.value = 0.0;
    };

  },

  tick: function(time, timeDelta) {

    this.deltaTimeSec = timeDelta / 1000;

    if(this.activateFinalChibaRoutine) {
      if (doRoutine(this.activateFinalChibaRoutine)) {
        this.activateFinalChibaRoutine = null;
      }
    }

    if(this.activatedFinalChiba) {
      return;
    }

    let done = true;
    this.chibaEls.forEach((c) => {
      if(!c.pVid){
        c.pVid = c.el.components["positional-video"]
        done = false;
        return;
      }

      if(c.pVid.timeOfLookAt > 3){
        c.done = true
      }

      if(!c.done){
        done = false;
      }

    })

    if(done && this.chibaEls.length > 2) {
      this.activatedFinalChiba = true;
      this.activateFinalChibaRoutine = this.activateCoroutine();
    }
  }
}

export default Chiba;
