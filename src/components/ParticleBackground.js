import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import styled from "styled-components";

const ParticleCanvas = styled.div`
  position: absolute;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: transparent;

  canvas {
    background: transparent !important;
  }

  @media (max-width: 768px) {
    left: 0;
  }
`;

const MODEL_URL =
  "https://spexai-public-assets.s3.us-west-2.amazonaws.com/models/blockchain_buzz_nug.glb";

const SPEXAI_COLORS = {
  primary: new THREE.Color(0x2fdda2), // Green
  secondary: new THREE.Color(0x4a6eec), // Blue
  accent: new THREE.Color(0x9b4bcc), // Purple
  highlight: new THREE.Color(0xfe3f68), // Red
};

const ParticleBackground = () => {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const particlesRef = useRef();
  const originalPositionsRef = useRef();
  const solidModelRef = useRef();
  const controlsRef = useRef();
  const colorRef = useRef(new THREE.Color(SPEXAI_COLORS.primary));
  const animationFrameRef = useRef(null);
  const isMountedRef = useRef(true);
  const modelGroupRef = useRef(null);

  const explodeEffect = (originalPos, i, time) => {
    const phase = (Math.sin(time * 0.5) + 1) * 0.5;
    const randomX = Math.sin(i * 0.5) * 0.4;
    const randomY = Math.cos(i * 0.5) * 0.4;
    const randomZ = Math.sin(i * 0.3) * 0.4;

    return {
      x: originalPos.x + randomX * phase,
      y: originalPos.y + randomY * phase,
      z: originalPos.z + randomZ * phase,
    };
  };

  useEffect(() => {
    let isMounted = true;
    const animationFrameRef = { current: null };

    // Scene setup
    sceneRef.current = new THREE.Scene();

    // Camera setup
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 50;

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0);
    rendererRef.current.domElement.style.background = "transparent";
    rendererRef.current.domElement.style.position = "absolute";
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Controls setup
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      containerRef.current
    );
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.screenSpacePanning = false;
    controlsRef.current.minDistance = 20;
    controlsRef.current.maxDistance = 300;
    controlsRef.current.enablePan = false;

    // Clear everything from the scene first
    const clearScene = () => {
      while (sceneRef.current?.children.length > 0) {
        const obj = sceneRef.current.children[0];
        sceneRef.current.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((material) => material.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    };

    clearScene();

    // Add lights ONCE
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, 1, -1);

    sceneRef.current.add(ambientLight);
    sceneRef.current.add(directionalLight);
    sceneRef.current.add(backLight);

    // Single model group reference
    let modelGroup = null;

    const loadModel = () => {
      if (!isMounted) return;

      // Clear any existing model
      if (modelGroup) {
        sceneRef.current.remove(modelGroup);
        modelGroup = null;
      }

      const loader = new GLTFLoader();

      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!isMounted) return;

          console.log("Loading new model");
          modelGroup = new THREE.Group();
          modelGroupRef.current = modelGroup;

          // Create single solid model
          solidModelRef.current = gltf.scene.clone();
          solidModelRef.current.traverse((child) => {
            if (child.isMesh) {
              // Use original materials but make them slightly transparent
              const originalMaterial = child.material.clone();
              originalMaterial.transparent = true;
              originalMaterial.opacity = 0.9;
              originalMaterial.side = THREE.DoubleSide;
              originalMaterial.depthWrite = true;
              child.material = originalMaterial;
              child.userData.hoverable = true;
            }
          });

          // Create single particle system
          const particles = new THREE.BufferGeometry();
          const particlePositions = [];
          originalPositionsRef.current = [];

          // Only traverse the original gltf.scene once
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              const geometry = child.geometry;
              const positionAttribute = geometry.attributes.position;
              const samplingRate = 8;

              child.updateWorldMatrix(true, false);
              const worldMatrix = child.matrixWorld;

              for (let i = 0; i < positionAttribute.count; i += samplingRate) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                vertex.applyMatrix4(worldMatrix);
                particlePositions.push(vertex.x, vertex.y, vertex.z);
                originalPositionsRef.current.push(vertex.clone());
              }
            }
          });

          particles.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(particlePositions, 3)
          );

          const material = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x2fdda2,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
          });

          particlesRef.current = new THREE.Points(particles, material);

          // Add both versions to group ONCE
          modelGroup.add(solidModelRef.current);
          modelGroup.add(particlesRef.current);

          // Scale and position
          modelGroup.scale.set(20, 20, 20);

          const box = new THREE.Box3().setFromObject(modelGroup);
          const center = box.getCenter(new THREE.Vector3());
          modelGroup.position.sub(center);

          // Position calculations
          const fov = cameraRef.current.fov * (Math.PI / 180);
          const screenWidth = window.innerWidth;
          const distanceToCamera = cameraRef.current.position.z;

          const rightOffset =
            Math.tan(fov / 2) *
            distanceToCamera *
            ((screenWidth - 200) / (screenWidth / 2) - 1);

          modelGroup.position.x = rightOffset;

          // Add group to scene ONCE
          sceneRef.current.add(modelGroup);

          console.log(
            "Scene children count:",
            sceneRef.current.children.length
          );
          console.log("Model group children:", modelGroup.children.length);

          // Camera and controls update
          const sceneBox = new THREE.Box3().setFromObject(sceneRef.current);
          const sceneCenter = sceneBox.getCenter(new THREE.Vector3());
          controlsRef.current.target.copy(sceneCenter);

          const boxSize = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
          const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

          cameraRef.current.position.x = rightOffset;
          cameraRef.current.position.z = cameraDistance * 0.5;
          controlsRef.current.update();
        },
        undefined,
        (error) => {
          if (!isMounted) return;
          console.error("Model loading error:", error);
        }
      );
    };

    const animate = () => {
      if (!isMounted) return;

      const animationId = requestAnimationFrame(animate);
      animationFrameRef.current = animationId;

      // Add rotation animation
      if (modelGroupRef.current) {
        const time = Date.now() * 0.0001; // Slow rotation speed
        modelGroupRef.current.rotation.y = time;
        modelGroupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
        modelGroupRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;
      }

      if (particlesRef.current && originalPositionsRef.current) {
        const positions =
          particlesRef.current.geometry.attributes.position.array;
        const time = Date.now() * 0.001;

        // Calculate phase for position and opacity
        const phase = (Math.sin(time * 0.5) + 1) * 0.5;

        // Fade out particles when they're close to original position
        // Phase close to 0 means particles are near original position
        const opacity = phase < 0.1 ? phase * 10 : 1;
        particlesRef.current.material.opacity = opacity;

        // Color animation
        const colorPhase = (Math.sin(time * 0.3) + 1) * 0.5;
        const currentColor = colorRef.current;

        if (colorPhase < 0.25) {
          currentColor.lerpColors(
            SPEXAI_COLORS.primary,
            SPEXAI_COLORS.secondary,
            colorPhase * 4
          );
        } else if (colorPhase < 0.5) {
          currentColor.lerpColors(
            SPEXAI_COLORS.secondary,
            SPEXAI_COLORS.accent,
            (colorPhase - 0.25) * 4
          );
        } else if (colorPhase < 0.75) {
          currentColor.lerpColors(
            SPEXAI_COLORS.accent,
            SPEXAI_COLORS.highlight,
            (colorPhase - 0.5) * 4
          );
        } else {
          currentColor.lerpColors(
            SPEXAI_COLORS.highlight,
            SPEXAI_COLORS.primary,
            (colorPhase - 0.75) * 4
          );
        }

        particlesRef.current.material.color = currentColor;

        // Position animation
        for (let i = 0; i < positions.length; i += 3) {
          const originalPos = originalPositionsRef.current[i / 3];
          const effect = explodeEffect(originalPos, i, time);

          positions[i] = effect.x;
          positions[i + 1] = effect.y;
          positions[i + 2] = effect.z;
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (
        controlsRef.current &&
        rendererRef.current &&
        sceneRef.current &&
        cameraRef.current
      ) {
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    loadModel();
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);

      // Recalculate position if model is loaded
      if (sceneRef.current.children.length > 0) {
        const fov = cameraRef.current.fov * (Math.PI / 180);
        const distanceToCamera = cameraRef.current.position.z;
        const rightOffset =
          Math.tan(fov / 2) *
          distanceToCamera *
          ((width - 200) / (width / 2) - 1);

        // Update model and camera position
        sceneRef.current.children[1].position.x = rightOffset;
        cameraRef.current.position.x = rightOffset;
        controlsRef.current.target.x = rightOffset;
        controlsRef.current.update();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      console.log("Cleaning up");
      isMounted = false;

      clearScene();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      // Clear all refs
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      particlesRef.current = null;
      solidModelRef.current = null;
      controlsRef.current = null;
      originalPositionsRef.current = null;
      modelGroup = null;

      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <ParticleCanvas ref={containerRef} />;
};

export default ParticleBackground;
