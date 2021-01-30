const { Document, Scene, NodeIO  } = require('@gltf-transform/core');

const io = new NodeIO();

(async () => {
  const doc = await io.read('../assets/models/bb.glb');
  const children = doc.getRoot().accessors;
  console.log(children)
  children.forEach(child => {
    console.log(child.wt)
  });
})()