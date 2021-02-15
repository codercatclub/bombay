import AFRAME from "aframe";
const THREE = AFRAME.THREE;

export default {
  schema: {
    part: { type: "string" },
    src: { type: "asset" },
  },

  init: function () {
    const part = this.data.part;
    const dummy = new THREE.Object3D();

    new THREE.GLTFLoader().load(
      this.data.src,
      (gltfModel) => {
        const scene = gltfModel.scene;
        const baseObject = scene.getObjectByName(part);

        const parentObject = new THREE.Object3D();

        // Make an array of each mesh name to its instanced mesh
        const instancedMeshes = [];
        let collider;
        baseObject.children.forEach((child) => {
          if (child.name == "collider") {
            collider = child;
          } else if (child.name !== "instances") {
            let name = child.name.charAt(child.name.length - 1);
            instancedMeshes[parseInt(name)] = {
              mesh: child,
              iMesh: 0,
              count: 0,
              curIdx: 0,
            };
          }
        });

        if (collider) {
          parentObject.add(collider);
        }

        const baseInstances = baseObject.getObjectByName("instances");

        if (!baseInstances) {
          console.log("Missing instance points for", baseObject.name);
        }

        const instancePoints = baseInstances.geometry;

        const {
          position: { array: pos },
          _orient: orient,
          _pscale: pscale,
          _type: type,
        } = instancePoints.attributes;

        if (!type) {
          console.log(
            '[!] Attribute "type" is required for instance GLTF meshes.'
          );
          return;
        }

        const instanceType = type.array;
        const totalCount = type.count;
        for (let x = 0; x < totalCount; x += 3) {
          instancedMeshes[instanceType[x]].count++;
        }

        instancedMeshes.forEach((meshGroup) => {
          let mesh = meshGroup.mesh;
          let count = meshGroup.count;
          meshGroup.iMesh = new THREE.InstancedMesh(
            mesh.geometry,
            mesh.material,
            count
          );
          meshGroup.iMesh.frustumCulled = false;
          meshGroup.iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        });

        for (let x = 0; x < totalCount; x += 3) {
          dummy.position.set(pos[3 * x], pos[3 * x + 1], pos[3 * x + 2]);

          // Set instance scale
          if (pscale) {
            const { array } = pscale;
            dummy.scale.set(array[x], array[x], array[x]);
          }

          // Set instance orientation
          if (orient) {
            const { array } = orient;
            dummy.quaternion.set(
              array[4 * x],
              array[4 * x + 1],
              array[4 * x + 2],
              array[4 * x + 3]
            );
          }

          dummy.updateMatrix();

          const meshName = instanceType[x];
          const idx = instancedMeshes[meshName].curIdx;

          instancedMeshes[meshName].iMesh.setMatrixAt(idx, dummy.matrix);
          instancedMeshes[meshName].curIdx++;
        }

        instancedMeshes.forEach((meshGroup) => {
          meshGroup.iMesh.instanceMatrix.needsUpdate = true;
          parentObject.add(meshGroup.iMesh);
        });
        this.el.setObject3D("mesh", parentObject);
      },
      function () {}, // Progress
      console.error
    );
  },
};
