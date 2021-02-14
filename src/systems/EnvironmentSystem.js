import AFRAME from 'aframe';
const THREE = AFRAME.THREE;
import { doRoutine } from "../Utils";

//this system should have a reference to all the cc basic materials

export default {
  schema: {
  },
  init: function() {
    this.registeredMaterials = [];
    this.storming = false;
    // light config
    this.colorConfig = { 
      "STORM" : {
        dirLightColor: new THREE.Color("#250bfb"),
        ambiLightColor: new THREE.Color("#250bfb"),
        horizonColor: new THREE.Color("#2708a0"),
        zenithColor: new THREE.Color("#250bfb"),
        fog: new THREE.Color("#250bfb"),
        shouldGlitch: 1,
        windAmt: 0.2,
      },
      "DAY" : {
        dirLightColor: new THREE.Color("#FFF"),
        ambiLightColor: new THREE.Color("#FFF"),
        horizonColor: new THREE.Color("#7572ff"),
        zenithColor: new THREE.Color("#3cf6ff"),
        fog: new THREE.Color("#FFF"),
        shouldGlitch: 0,
        windAmt: 0.05
      },
      "TELEPORT" : {
        dirLightColor: new THREE.Color("#ff00ff"),
        ambiLightColor: new THREE.Color("#ffffff"),
        horizonColor: new THREE.Color("#0000ff"),
        zenithColor: new THREE.Color("#ff00ff"),
        fog: new THREE.Color("#250bfb"),
        shouldGlitch: 1,
        windAmt: 0.2,
      }
    };


    let dirLight = document.querySelector('#dirLight');
    dirLight.addEventListener("object3dset", (event) => {
      this.dirLight = event.target.object3D.children[0];
    })
    let ambiLight = document.querySelector('#ambiLight');
    ambiLight.addEventListener("object3dset", (event) => {
      this.ambiLight = event.target.object3D.children[0];
    })
    this.fadeEnvCoroutine = function* (from, to) {
      let t = 0;
      while (t <= 1) {
        this.LerpEnvColors(from, to, t*t*t)
        t += this.deltaTimeSec/5.66;
        yield;
      }
    };
    window.addEventListener("keydown", (evt) => {
      if(evt.code == "KeyT"){
        this.toggleStorm();
      }
    })
  },
  LerpEnvColors: function(from, to, t) {

    this.dirLight.color.copy(this.colorConfig[from].dirLightColor).lerp(this.colorConfig[to].dirLightColor, t);
    this.ambiLight.color.copy(this.colorConfig[from].ambiLightColor).lerp(this.colorConfig[to].ambiLightColor, t);
    this.registeredMaterials.forEach((mat) => {
      mat.materialShaders.forEach((shader) => {
        if(to == "TELEPORT"){
          shader.uniforms["teleportProgress"].value = t;
        }
        shader.uniforms["globalGlitchAmt"].value = (1-t) * this.colorConfig[from].shouldGlitch +  t * this.colorConfig[to].shouldGlitch;
        shader.uniforms["windAmt"].value = (1-t) * this.colorConfig[from].windAmt +  t * this.colorConfig[to].windAmt;
      })
    })

    if(this.sky){
      this.sky.skyMaterial.uniforms.horizonColor.value.copy(this.colorConfig[from].horizonColor).lerp(this.colorConfig[to].horizonColor,t);
      this.sky.skyMaterial.uniforms.zenithColor.value.copy(this.colorConfig[from].zenithColor).lerp(this.colorConfig[to].zenithColor,t);
    }

    this.sceneEl.object3D.fog.color.copy(this.colorConfig[from].fog).lerp(this.colorConfig[to].fog, t);

  },
  toggleStorm: function() {
    if (this.fadeEnvRoutine) {
      return;
    }
    this.storming = !this.storming;
    let toVal = this.storming ? "STORM" : "DAY";
    let fromVal = this.storming ? "DAY": "STORM";
    this.fadeEnvRoutine = this.fadeEnvCoroutine(fromVal, toVal);
  },

  registerMaterial: function(mat) {
    this.registeredMaterials.push(mat);
  },
  tick: function (time ,timeDelta) {
    if(!this.sky){
      this.sky = document.querySelector('#sky').components["sky-material"]
    } 
    this.deltaTimeSec = timeDelta/1000;

    if (this.fadeEnvRoutine) {
      if (doRoutine(this.fadeEnvRoutine)) {
        this.fadeEnvRoutine = null;
      }
    }

    //Current Env Effects
    //-Wind & storm
    //-Total Glitch effect
    //-General color time changes 
  }
};