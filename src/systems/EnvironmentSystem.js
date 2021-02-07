import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

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

    window.addEventListener("keydown", (evt) => {
      if(evt.code == "KeyT"){
        this.toggleStorm();
      }
    })
  },
  toggleStorm: function() {

    this.storming = !this.storming;

    let configVal = this.storming ? "STORM" : "DAY";
    this.dirLight.color = this.colorConfig[configVal].dirLightColor
    this.ambiLight.color = this.colorConfig[configVal].ambiLightColor

    this.registeredMaterials.forEach((mat) => {
      mat.materialShaders.forEach((shader) => {
        shader.uniforms["globalGlitchAmt"].value = this.colorConfig[configVal].shouldGlitch;
        shader.uniforms["windAmt"].value = this.colorConfig[configVal].windAmt;
      })
    })

    if(this.sky){
      this.sky.skyMaterial.uniforms.horizonColor.value = this.colorConfig[configVal].horizonColor;
      this.sky.skyMaterial.uniforms.zenithColor.value = this.colorConfig[configVal].zenithColor;
    }

    this.sceneEl.object3D.fog.color = this.colorConfig[configVal].fog;
  },
  registerMaterial: function(mat) {
    this.registeredMaterials.push(mat);
  },
  tick: function (time ,timeDelta) {
    if(!this.sky){
      this.sky = document.querySelector('#sky').components["sky-material"]
    } 
    //Current Env Effects
    //-Wind & storm
    //-Total Glitch effect
    //-General color time changes 
  }
};