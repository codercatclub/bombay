import AFRAME from 'aframe';

const THREE = AFRAME.THREE;

const Chiba = {
  schema: {
    chiba1: { type: "string", default: "chiba4" },
    chiba2: { type: "string", default: "chiba3" },
    chiba3: { type: "string", default: "chiba0" },
    finalChiba: { type: "string", default: "chiba1" },
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
  },

  tick: function(time, timeDelta) {
    if(this.activateFinalChibaRoutine) {
      return
    }
    let done = true;
    this.chibaEls.forEach((c) => {
      if(!c.pVid){
        c.pVid = c.el.components["positional-video"]
        return;
      }

      if(c.pVid.timeOfLookAt > 3){
        c.done = true
        console.log(c.el)
      }

      if(!c.done){
        done = false;
      }

    })

    if(done && this.chibaEls.length > 2) {
      this.activateFinalChiba = true;
    }
  }
}

export default Chiba;
