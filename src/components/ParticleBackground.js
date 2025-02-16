import { useEffect, useRef } from "react";
import * as THREE from "three";
import styled from "styled-components";

const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const ParticleBackground = () => {
  const containerRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Mountain particle setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000; // Increased particle count
    const posArray = new Float32Array(particlesCount * 3);

    // Create mountain-like distribution
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // X position - spread across width
      posArray[i3] = (Math.random() - 0.5) * 8;

      // Y position - create peaks and valleys
      const baseHeight = Math.sin(posArray[i3] * 0.5) * 1.5; // Basic mountain shape
      const noise = Math.random() * 0.5; // Add randomness
      posArray[i3 + 1] = baseHeight + noise;

      // Z position - add depth
      posArray[i3 + 2] = (Math.random() - 0.5) * 3;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: "#ffffff",
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Position camera to view mountains
    camera.position.z = 2;
    camera.position.y = 0.5;
    camera.rotation.x = -0.2;

    // Mouse movement handler
    const handleMouseMove = (event) => {
      mouseX.current = event.clientX / window.innerWidth - 0.5;
      mouseY.current = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle rotation
      particlesMesh.rotation.y += 0.0005;

      // Subtle wave motion
      const positions = particlesGeometry.attributes.position.array;
      const time = Date.now() * 0.0001;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i] * 0.5) * 0.001;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Mouse interaction
      camera.position.x += (mouseX.current * 0.5 - camera.position.x) * 0.05;
      camera.position.y +=
        (-mouseY.current * 0.5 - camera.position.y + 0.5) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <BackgroundWrapper ref={containerRef} />;
};

export default ParticleBackground;
