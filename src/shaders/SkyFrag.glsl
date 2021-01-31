uniform float time;
uniform sampler2D noise;
varying vec2 vUv;
varying vec3 vPos;
uniform vec3 horizonColor;
uniform vec3 zenithColor;

void main() {
  // float remappedY = 2.0*(max(vUv.y, 0.5)-0.5); 
  // float blockY = ceil(abs(remappedY * 20.0))/20.0;
  // float block = ceil(mod(abs(vUv.x * 40.0),10.0))/10.0; 
  // float noiseColX = texture2D(noise, vec2(block,mod(0.00004*time,1.0))).x;
  // float noiseColY = texture2D(noise, vec2(blockY,mod(0.00004*time,1.0))).x;
  // vec3 toZenithColor = mix(horizonColor, zenithColor, 0.33*(noiseColX + noiseColY) + blockY);
  // float noiseColX2 = texture2D(noise, vec2(fract(block + 0.00005*time),fract(blockY))).x;
  // noiseColX2 *= step(0.35,remappedY)*step(remappedY,0.6);
  // toZenithColor += 0.05*vec3(1.0,1.0,1.0)*(1.0-step(noiseColX2, 0.54));
  // gl_FragColor = vec4(toZenithColor, 1.0);
  
  float remappedY = pow(vUv.y,2.0); 
  float remappedX = vUv.x; 
  vec3 zenColor = zenithColor;
  vec3 horColor = horizonColor;
  if(remappedY < 0.0){
    zenColor = horizonColor;
    horColor = zenithColor;
  }
  float blockY = ceil(abs(remappedY * 40.0))/40.0;
  float block = ceil(mod(abs(remappedX * 70.0),10.0))/10.0; 
  float noiseColX = texture2D(noise, vec2(block,mod(0.00004*time,1.0))).x;
  float noiseColY = texture2D(noise, vec2(blockY,mod(0.00004*time,1.0))).x;

  vec3 toZenithColor = mix(horColor, zenColor, 0.33*(noiseColX + noiseColY) + blockY);
  float noiseColX2 = texture2D(noise, vec2(fract(block + 0.00005*time),fract(blockY))).x;
  noiseColX2 *= step(0.5,remappedY);
  toZenithColor += 0.05*vec3(1.0,1.0,1.0)*(1.0-step(noiseColX2, 0.54));
  gl_FragColor = vec4(toZenithColor, 1.0);
}
