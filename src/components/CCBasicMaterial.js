import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

import CCBasicVert from '../shaders/CCBasicVert.glsl';
import CCBasicFrag from '../shaders/CCBasicFrag.glsl';

export default {
  schema: {
    timeMsec: { default: 1 },
    voxelSize: { default: 1 },
    shouldGlitch: { default: 0 },
    globalGlitchAmt: { default: 0 },
    windAmt: { default: 0.05 },
    ignoreGlobalGlitch: { default: 1 },
    teleportProgress: { default: 0 },
    seaAmt: { default: 0 },
    color: { type: 'color', default: "#ffffff" },
    vertexColors: { type: 'string', default: '' },
    instanced: { type: 'bool', default: false },
    transparent: { type: 'bool', default: false }
  },

  init: function () {
    const { vertexColors, color, instanced, transparent, seaAmt } = this.data;
    this.seaDefine = seaAmt > 0.0 ? "" : undefined;
    this.uniforms = this.initVariables(this.data);
    this.vAmt = 0.0;

    const materialOptions = {
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: transparent,
    }

    switch (vertexColors) {
      case '':
        break;

      case 'vertex':
        materialOptions.vertexColors = THREE.VertexColors;
        break;

      case 'face':
        materialOptions.vertexColors = THREE.FaceColors;
        break;
    
      default:
        console.log('Unknown value for vertexColor parameter. Accepted values are "vertex" or "face".');
        break;
    }

    //push atleast one
    let mat = this.createMaterial(materialOptions);

    this.basicMats = [mat];
    this.materialShaders = []

    this.el.sceneEl.systems["env-system"].registerMaterial(this);
  
    this.el.addEventListener('object3dset', () => {
      // Assign material to all child meshes
      this.el.object3D.traverse(child => {
        if (child.type === 'Mesh') {
          let mat;
          if(!instanced){
            mat = this.basicMats[0];
          } else {
            // make a new material
            mat = this.createMaterial(materialOptions);
            this.basicMats.push(mat)
          }

          if(child.material.map){
            mat.map = child.material.map;
          }
          child.material = mat;
        }
      });


    });

    this.moverComponent = document.querySelector('#camera').components.mover;
    this.timeMoving = 0.0;

  },

  createMaterial: function (materialOptions) {
    let mat = new THREE.MeshPhongMaterial(materialOptions);
    mat.defines = {
      "SEA": this.seaDefine
    }

    mat.onBeforeCompile = (shader) => {
      shader.uniforms = THREE.UniformsUtils.merge([this.uniforms, shader.uniforms]);
      shader.vertexShader = CCBasicVert;
      shader.fragmentShader = CCBasicFrag;
      this.materialShaders.push(shader)
    };

    mat.extensions = {
      derivatives: true
    };
    return mat;
  },

  initVariables: function (data, type) {
    let key;
    let variables = {};
    for (key in data) {
      variables[key] = {
        value: data[key],
      };
    }
    return variables;
  },

  update: function (data) {
    if (this.materialShaders.length <= 0) {
      return;
    }

    let key;
    for (key in data) {
      this.materialShaders.forEach(shader => {
        shader.uniforms[key].value = data[key];
        shader.uniforms[key].needsUpdate = true;
      })
    }
  },

  tick: function (time, timeDelta) {
    if (this.materialShaders.length > 0) {
      if(this.moverComponent.moveAmt < 0.001 || this.moverComponent.teleportRoutine){
        this.timeMoving = 0.0
      } else {
        this.timeMoving += timeDelta;
      }

      if(this.timeMoving > 2000.0) {
        this.vAmt = 0.99 * this.vAmt + 0.01* this.moverComponent.moveAmt;
      } else {
        this.vAmt = 0.9 * this.vAmt;
      }
      this.materialShaders.forEach(shader => {
        shader.uniforms.timeMsec.value = time;
        shader.uniforms.voxelSize.value = 5*(this.vAmt + 0.0001);
      })
    }
  },
};
