import AFRAME from 'aframe';

import 'aframe-gltf-part-component';
import 'aframe-extras';

import Mover from './components/Mover';
import QuickTurn from './components/QuickTurn';
import CCBasicMaterial from './components/CCBasicMaterial';
import SkyMaterial from './components/SkyMaterial';
import GLTFCamera from './components/GLTFCamera';
import GeoInspector from './components/GeoInspector';
import FBXLoader from './components/FBXLoader';
import AnimationPlayer from './components/AnimationPlayer';
import InstancedGLTFPart from './components/InstancedGLTFPart';
import Chihuahua from './components/Chihuahua';
import WarpPoint from './components/WarpPoint';
import StormTriggerPoint from './components/StormTriggerPoint';
import PositionalVideo from './components/PositionalVideo';
import Collider from './components/Collider';

import TestSystem from './systems/TestSystem';
import SoundSystem from './systems/SoundSystem';
import EnvSystem from './systems/EnvironmentSystem';
import Chiba from './components/Chiba';
import Dome from './components/Dome';

const THREE = AFRAME.THREE;

// Register all shaders


// Register all systems
AFRAME.registerSystem('test-system', TestSystem);
AFRAME.registerSystem('sound-system', SoundSystem);
AFRAME.registerSystem('env-system', EnvSystem);

// Register all components
AFRAME.registerComponent('gltf-camera', GLTFCamera);
AFRAME.registerComponent('mover', Mover);
AFRAME.registerComponent('quick-turn', QuickTurn);
AFRAME.registerComponent('geo-inspect', GeoInspector);
AFRAME.registerComponent('ccbasic-material', CCBasicMaterial);
AFRAME.registerComponent('sky-material', SkyMaterial);
AFRAME.registerComponent('fbx', FBXLoader);
AFRAME.registerComponent('animation-player', AnimationPlayer);
AFRAME.registerComponent('instanced-gltf-part', InstancedGLTFPart);
AFRAME.registerComponent('chihuahua', Chihuahua);
AFRAME.registerComponent('warp-point', WarpPoint);
AFRAME.registerComponent('storm-trigger-point', StormTriggerPoint);
AFRAME.registerComponent('positional-video', PositionalVideo);
AFRAME.registerComponent('collider', Collider);
AFRAME.registerComponent('chiba-activator', Chiba);
AFRAME.registerComponent('dome', Dome);
