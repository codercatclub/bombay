import AFRAME from 'aframe';
const THREE = AFRAME.THREE;

export default {
    schema: {
        part: { type: 'string' },
        src: { type: 'asset' }
    },
    init: function () {
        let part = this.data.part;
        let dummy = new THREE.Object3D();
        new THREE.GLTFLoader().load(this.data.src, (gltfModel) => {
            let scene = gltfModel.scene;
            let baseObject = scene.getObjectByName(part);

            let parentObject = new THREE.Object3D();

            //make an array of each mesh name to its instanced mesh
            let instancedMeshes = []
            baseObject.children.forEach((child) => {
                if(child.name !== "instances"){
                    let name = child.name.charAt(child.name.length-1);
                    instancedMeshes[parseInt(name)] = {
                        mesh: child,
                        iMesh: 0,
                        count: 0,
                        curIdx: 0
                    };
                }
            });
            let baseInstances = baseObject.getObjectByName("instances").geometry;
            let pos = baseInstances.attributes.position.array;
            let scale = baseInstances.attributes._pscale.array;
            let orient = baseInstances.attributes._orient.array;
            let type = baseInstances.attributes._type.array;
            let totalCount = baseInstances.attributes._type.count;

            for (let x = 0; x < totalCount; x+=3) {
                instancedMeshes[type[x]].count ++
            }
            instancedMeshes.forEach( meshGroup =>  {
                let mesh = meshGroup.mesh;
                let count = meshGroup.count;
                meshGroup.iMesh = new THREE.InstancedMesh( mesh.geometry, mesh.material, count );
                meshGroup.iMesh.frustumCulled = false;
                meshGroup.iMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

            })

            for (let x = 0; x < totalCount; x+=3) {
                dummy.position.set(pos[3*x], pos[3*x+1], pos[3*x+2]);
                dummy.scale.set(scale[x], scale[x], scale[x]);
                dummy.quaternion.set(orient[4*x], orient[4*x+1], orient[4*x+2], orient[4*x+3]);
                dummy.updateMatrix();

                let meshName = type[x];
                let idx = instancedMeshes[meshName].curIdx;
                instancedMeshes[meshName].iMesh.setMatrixAt(idx, dummy.matrix);
                instancedMeshes[meshName].curIdx++;
            }

            instancedMeshes.forEach( meshGroup =>  {
                meshGroup.iMesh.instanceMatrix.needsUpdate = true;
                parentObject.add(meshGroup.iMesh)
            })

            this.el.setObject3D('mesh', parentObject);
          }, function () { }, console.error);
    },
};
