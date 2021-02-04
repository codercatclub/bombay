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
uniform float changeColor;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
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
	// reflectedLight.indirectDiffuse.g += changeColor * 0.4 * (0.5 + 0.5*sin(0.001*timeMsec));
	// reflectedLight.indirectDiffuse.b += changeColor * 0.4 * (0.5 + 0.5*sin(0.001*timeMsec + 1.0));

	// vec3 fractBy3 = vec3(
	// 	floor(fract(.01 * timeMsec) + 0.5),
	// 	floor(fract(.01 * timeMsec+0.3) + 0.5),
	// 	floor(fract(.01 * timeMsec+0.6) + 0.5)
	// );
	// reflectedLight.indirectDiffuse.rgb += changeColor*fractBy3;

    reflectedLight.directDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;


	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <encodings_fragment>
	@import ./FogFrag;
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}