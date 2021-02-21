@import ./PerlinNoise;

uniform float time;
uniform sampler2D noiseTex;
varying vec2 vUv;
varying vec3 vPos;
uniform vec3 horizonColor;
uniform vec3 zenithColor;
uniform vec3 fractBy3;
uniform float blockSizeMult;

void main() {
  float blockSizeMultLerp = 1.0 - blockSizeMult*fract(0.0005*time);
  
  float remappedY = pow(vUv.y,2.0); 
  float remappedX = vUv.x; 
  vec3 zenColor = zenithColor;
  vec3 horColor = horizonColor;
  if(remappedY < 0.0){
    zenColor = horizonColor;
    horColor = zenithColor;
  }


  float blockY = ceil(abs(remappedY * blockSizeMultLerp*40.0))/(blockSizeMultLerp * 40.0);
  float block = ceil(mod(abs(remappedX * 70.0*blockSizeMultLerp),(blockSizeMultLerp*10.0)))/(blockSizeMultLerp*10.0); 

  horColor.rgb = mix(vec3(block,blockY,1.0), horColor, blockSizeMultLerp);
  zenColor.rgb = mix(vec3(block,blockY,1.0), zenColor, blockSizeMultLerp);

  float noiseColX = texture2D(noiseTex, vec2(block,mod(0.00004*time,1.0))).x;
  float noiseColY = texture2D(noiseTex, vec2(blockY,mod(0.00004*time,1.0))).x;

  vec3 toZenithColor = mix(horColor, zenColor, 0.33*(noiseColX + noiseColY) + blockY);
  float noiseColX2 = texture2D(noiseTex, vec2(fract(block + 0.00005*time),fract(blockY))).x;
  noiseColX2 *= step(0.5 * blockSizeMultLerp,remappedY);

  toZenithColor = mix(toZenithColor, mix(fractBy3,toZenithColor + 0.05*vec3(1.0,1.0,1.0),blockSizeMultLerp), (1.0-step(noiseColX2, 0.54)));

  gl_FragColor = vec4(toZenithColor, 1.0);


}
