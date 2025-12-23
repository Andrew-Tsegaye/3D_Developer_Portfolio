import { useGLTF } from "@react-three/drei";
import { useRef, Suspense } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Local model path (file is in `public/models/target_poster.glb`)
const MODEL_PATH = "/models/target_poster.glb";

export function PosterModel(props) {
  // useGLTF will throw if the file isn't found or isn't a proper glTF.
  // We defensively render either a target mesh (if node names match)
  // or fall back to rendering the whole glTF scene to avoid crashes.
  const gltf = useGLTF(MODEL_PATH);
  const { nodes, materials, scene } = gltf;

  // If the expected node exists, render it directly for more control.
  if (nodes && nodes.pCylinder3_blinn1_0 && materials && materials.blinn1) {
    return (
      <group {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.pCylinder3_blinn1_0.geometry}
          material={materials.blinn1}
        />
      </group>
    );
  }

  // Fallback: render the full scene. This prevents `undefined` errors
  // when the node/material names don't match the expected ones.
  // Log a helpful warning for debugging.
  // eslint-disable-next-line no-console
  console.warn(
    "PosterModel: expected node/material not found — falling back to glTF scene render. Inspect gltf keys to adapt component."
  );
  return <primitive object={scene} {...props} />;
}

useGLTF.preload(MODEL_PATH);

const Placeholder = () => (
  <mesh>
    <boxGeometry args={[0.6, 0.6, 0.6]} />
    <meshStandardMaterial color="#ff4d4d" />
  </mesh>
);

const Target = ({ scale = 3, ...props }) => {
  const targetRef = useRef();

  useGSAP(() => {
    if (!targetRef.current) return;
    gsap.to(targetRef.current.position, {
      y: targetRef.current.position.y + 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <mesh
      {...props}
      ref={targetRef}
      rotation={[0, Math.PI / 5, 0]}
      scale={scale}
    >
      <Suspense fallback={<Placeholder />}>
        <PosterModel />
      </Suspense>
    </mesh>
  );
};

export default Target;
