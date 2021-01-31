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
            let baseMesh = baseObject.getObjectByName("mesh");
            let baseInstances = baseObject.getObjectByName("instances").geometry;
            let pos = baseInstances.attributes.position.array;
            let scale = baseInstances.attributes._pscale.array;
            let orient = baseInstances.attributes._orient.array;

            let count = baseInstances.attributes.position.count;
            let mesh = new THREE.InstancedMesh( baseMesh.geometry, baseMesh.material, count );
            mesh.frustumCulled = false;

            for ( let x = 0; x < count; x ++ ) {
                dummy.position.set(pos[3*x], pos[3*x+1], pos[3*x+2]);
                dummy.scale.set(scale[x], scale[x], scale[x]);
                dummy.quaternion.set(orient[4*x], orient[4*x+1], orient[4*x+2], orient[4*x+3]);
                dummy.updateMatrix();
                mesh.setMatrixAt( x, dummy.matrix );
            }

            mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            console.log(mesh)
            mesh.instanceMatrix.needsUpdate = true;
            this.el.setObject3D('mesh', mesh);
          }, function () { }, console.error);
    },
};
