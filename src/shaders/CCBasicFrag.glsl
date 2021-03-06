@import ./PerlinNoise;

uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <lights_pars_begin>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
@import ./FogFragPars;
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec3 vViewPos;
varying float glitchAmt;
uniform float teleportProgress;
uniform float shouldGlitch;
uniform float ignoreGlobalGlitch;
uniform float posterize;
uniform vec3 fractBy3;
#ifdef SEA
uniform float seaAmt;
varying float colorAmt;
#endif

void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	float usePosterize = step(0.01, posterize+teleportProgress);
	float useBasePosterize = step(0.01, posterize);
	float telePosterize = 10.0 - 8.0*teleportProgress;
	float fAmt = mix(telePosterize, min(telePosterize,posterize), useBasePosterize);

#ifdef USE_MAP
	vec2 modUv = vUv.xy;
	modUv = mix(vUv.xy, floor(modUv.xy*10.0*fAmt+0.2)/(10.0*fAmt), usePosterize);
 	vec4 texelColor = texture2D( map, modUv );
 	texelColor = mapTexelToLinear( texelColor );


 	diffuseColor *= texelColor;
	diffuseColor = mix(diffuseColor, floor(fAmt*diffuseColor)/fAmt, usePosterize);


 #endif
	#include <color_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	reflectedLight.indirectDiffuse += getAmbientLightIrradiance(ambientLightColor);
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	// ambient*diffuse

	vec3 normal = normalize( cross(dFdx(vViewPos.xyz), dFdy(vViewPos.xyz)) );

	//add basic toon lighting 
	#if ( NUM_DIR_LIGHTS > 0 )
		DirectionalLight directionalLight;
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
			directionalLight = directionalLights[ i ];
			float lightAmt = saturate(dot(directionalLight.direction, normal));
			reflectedLight.directDiffuse += lightAmt*directionalLight.color;
		}
	#endif

	#ifdef SEA
		reflectedLight.indirectDiffuse += floor(5.0*5.0*colorAmt * mix(vec3(0.0,0.8,0.5), vec3(1.0,0.8,0.5), colorAmt))/5.0;
		reflectedLight.indirectDiffuse = saturate(reflectedLight.indirectDiffuse);
	#endif 
	
	//reflectedLight.indirectDiffuse.rgb += ignoreGlobalGlitch * max(glitchAmt, shouldGlitch)*fractBy3;
	reflectedLight.indirectDiffuse.rgb = mix(reflectedLight.indirectDiffuse.rgb, fractBy3, glitchAmt);
    reflectedLight.directDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

	// outgoingLight = mix(outgoingLight, floor(fAmt*outgoingLight)/fAmt, usePosterize);

	gl_FragColor = vec4( outgoingLight, diffuseColor.a);

	#ifdef HALO
		float radius = fract(timeMsec / 1000.0);
		float t = fract(timeMsec / 390.0);
		float qAmt = 5.0 + floor(10.0 * t);
		vec2 vToUse = floor(vUv * qAmt) / qAmt;
		vec2 vToCenter = 2.0 * (vToUse - vec2(0.5,0.5));
		float dToCenter = length(vToCenter);
		float oNoise = 0.4 *cnoise(10.0*vToUse + 0.0001*timeMsec);

		if(abs(dToCenter-radius) < 0.1 + oNoise) {
			gl_FragColor.rgb = fractBy3;
		} else {
			gl_FragColor.rgb = vec3(vToCenter, radius);
		}
		gl_FragColor.a = 1.0 - pow(dToCenter,3.0);
	#endif 
	#include <encodings_fragment>
	@import ./FogFrag;
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}