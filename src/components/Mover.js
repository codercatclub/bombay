import AFRAME, { utils } from "aframe";
const THREE = AFRAME.THREE;

import { doRoutine, calculateGroundHeight } from "../Utils";

const Mover = {
  schema: {
    groundID: { type: "string", default: "ground" },
    controllerID: { type: "string", default: "rightHandContloller" },
    cameraID: { type: "string", default: "camera" },
    cameraRigID: { type: "string", default: "cameraRig" },
    speed: { type: "number", default: 1 },
  },

  init: function () {
    const { groundID, cameraRigID, controllerID, cameraID, speed } = this.data;

    this.isVR = false;
    this.touchMove = false;
    this.lastAxis = new THREE.Vector2();
    this.moveAmt = 0.0;
    this.vrMovingSpeed = 0.0039 * speed;

    const cameraRigEl = document.querySelector(`#${cameraRigID}`);
    this.cameraRig = cameraRigEl.object3D;

    const controller = document.querySelector(`#${controllerID}`);

    const camera = document.querySelector(`#${cameraID}`);
    this.wasdControls = camera.getAttribute("wasd-controls");
    this.lookControls = camera.components["look-controls"];
    this.camera = camera.object3D;
    this.lastCameraPosition = new THREE.Vector3().copy(this.camera.position);

    // ground raycasting
    this.raycaster = new THREE.Raycaster();
    const ground = document.querySelector(`#${groundID}`);

    this.terrain = new THREE.Object3D();

    // wait for mesh to load
    ground.addEventListener("object3dset", (event) => {
      const group = event.target.object3D;
      const groundMesh = group.getObjectByProperty("type", "Mesh");
      this.terrain.add(groundMesh);
    });

    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        if (supported) {
          this.isVR = true;
          // set camera to the right pos 
          this.cameraRig.position.set(-12, 6, 150);
        }
      });
    }
    this.worldQuat = new THREE.Quaternion();

    /*
      Oculus remote controller events
    */
    controller.addEventListener("axismove", (evt) => {
      this.lastAxis.x = evt.detail.axis[2];
      this.lastAxis.y = evt.detail.axis[3];
    });

    /*
      Mobile events
    */
    document.addEventListener("touchstart", (evt) => {
      this.touchMove = true;
    });

    document.addEventListener("touchend", (evt) => {
      this.touchMove = false;
    });

    //temp tele
    window.addEventListener("keydown", (evt) => {
      if(evt.code == "KeyL"){
        this.Teleport(new THREE.Vector3(0,1,0));
      }
    })
    this.teleportCoroutine = function* () {
      //fade in progress event
      let envSystem = this.el.sceneEl.systems["env-system"]
      let t = 0;
      let curMode = envSystem.storming ? "STORM" : "DAY";
      while (t <= 1) {
        envSystem.LerpEnvColors(curMode, "TELEPORT", t*t*t)
        t += this.deltaTimeSec/2.267;
        yield;
      }
      envSystem.LerpEnvColors(curMode, "TELEPORT", 1.0)
      // wait a few seconds
      // let d = Date.now();
      // while (Date.now() - d < 3000) {
      //   yield;
      // }
      if (this.isVR) {
        this.cameraRig.position.copy(this.lastTelePos);
        this.cameraRig.rotation.y = Math.PI;
      } else {
        this.camera.position.copy(this.lastTelePos);
        this.lookControls.yawObject.rotation.y = Math.PI;
      }
      yield;
      //fade out progress event
      while (t >= 0) {
        envSystem.LerpEnvColors(curMode, "TELEPORT", t*t*t)
        t -= this.deltaTimeSec/2.267;
        yield;
      }
      envSystem.LerpEnvColors(curMode, "TELEPORT", 0.0)
    };
  },

  tick: function (time, timeDelta) {
    this.deltaTimeSec = timeDelta/1000;
    let prevPos = this.lastCameraPosition.clone();

    if (this.teleportRoutine) {
      if (doRoutine(this.teleportRoutine)) {
        this.teleportRoutine = null;
      }
      this.wasdControls.enabled = false;
      return;
    }
    this.wasdControls.enabled = true;
    this.camera.getWorldQuaternion(this.worldQuat);
    
    this.tweenForward = new THREE.Vector3(
      -this.lastAxis.x,
      0,
      -this.lastAxis.y
    ).applyQuaternion(this.worldQuat.premultiply(this.camera.quaternion));

    // Move to direaction of the camera on Mobile devices
    if (this.touchMove && !this.isVR) {
      this.camera.getWorldDirection(this.tweenForward).multiplyScalar(this.data.speed);
    }

    if (this.isVR) {
      this.handleVRMove(this.tweenForward, timeDelta);
    } else {
      this.handleMove(this.tweenForward, timeDelta);
    }

    this.moveAmt = this.lastCameraPosition.distanceTo(prevPos);
  },

  handleVRMove: function (move, timeDelta) {
    this.cameraRig.position.sub(
      move.multiplyScalar(this.vrMovingSpeed * timeDelta)
    );
    const groundHeight =
      calculateGroundHeight(
        this.cameraRig.position,
        this.raycaster,
        this.terrain
      ) + 1.8;
    if(groundHeight < -50)
    {
      this.cameraRig.position.copy(this.lastCameraPosition);
    } else {
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.cameraRig.position.y =
      lerpSpeed * groundHeight + (1 - lerpSpeed) * this.cameraRig.position.y;
      this.lastCameraPosition.copy(this.cameraRig.position);
    }
  },
  handleMove: function (move, timeDelta) {
    const groundHeight =
      calculateGroundHeight(
        this.camera.position,
        this.raycaster,
        this.terrain
      ) + 1.8;
    if(groundHeight < -50)
    {
      this.camera.position.copy(this.lastCameraPosition);
      this.wasdControls.enabled = false;
    } else {
      this.wasdControls.enabled = true;
      const lerpSpeed = Math.min(0.01 * timeDelta, 1);
      this.camera.position.y =
      lerpSpeed * groundHeight + (1 - lerpSpeed) * this.camera.position.y;
      this.lastCameraPosition.copy(this.camera.position);
    }
  },
  Teleport: function (pos, forward) {
    if (this.teleportRoutine) {
      return;
    }
    // document.querySelector('#teleport-sound').components["sound"].playSound()
    this.lastTelePos = pos;
    this.lastTelePos.y =
      calculateGroundHeight(this.lastTelePos, this.raycaster, this.terrain) +
      1.8;
    this.teleportRoutine = this.teleportCoroutine();
  },
};

export default Mover;
