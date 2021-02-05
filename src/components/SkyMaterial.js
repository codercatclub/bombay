import AFRAME from 'aframe';
import SkyFrag from '../shaders/SkyFrag.glsl';
import SkyVert from '../shaders/SkyVert.glsl';

export default {
  init: function () {
    //#4bd6ff
    const noiseTexture = new THREE.TextureLoader().load('/assets/noise.jpg');
    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        noise: {
          value: noiseTexture
        },
        time: {
          value: 0
        },
        horizonColor: {
          value: new THREE.Color("#7572ff")
        },
        zenithColor: {
          value: new THREE.Color("#3cf6ff")
        },
      },
      vertexShader: SkyVert,
      fragmentShader: SkyFrag,
      side: THREE.BackSide
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(10000,100), this.skyMaterial);
    mesh.rotation.x = -0.3;
    this.el.object3D.add(mesh);
  },

  tick: function (time, timeDelta) {
    this.skyMaterial.uniforms.time.value = time;
  }
};
