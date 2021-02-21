import AFRAME from 'aframe';
import SkyFrag from '../shaders/SkyFrag.glsl';
import SkyVert from '../shaders/SkyVert.glsl';

export default {
  init: function () {
    //#4bd6ff
    // TODO (Kirill): This need to be loaded with asset manager
    const noiseTexture = new THREE.TextureLoader().load('assets/noise.jpg');
    
    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        noiseTex: {
          value: noiseTexture
        },
        time: {
          value: 0
        },
        blockSizeMult: {
          value: 0
        },
        fractBy3: {
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
    this.fractBy3 = new THREE.Vector3();

  },

  tick: function (time, timeDelta) {
    this.fractBy3.set(
      Math.floor((.0075 * time)%1 + 0.5),
      Math.floor((.0075 * time+0.3)%1 + 0.5),
      Math.floor((.0075 * time+0.6)%1 + 0.5)
    );
    this.skyMaterial.uniforms.time.value = time;
    this.skyMaterial.uniforms.fractBy3.value = this.fractBy3;
  }
};
