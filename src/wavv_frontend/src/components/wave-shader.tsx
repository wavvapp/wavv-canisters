
import { useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Vector2, ShaderMaterial, Mesh } from "three"

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
  }

  void main() {
    vec2 st = vUv * 3.0;
    float t = uTime * 0.2;
    float wave = sin(st.x * 2.0 + t) * 0.5 + 0.5;
    
    float n1 = noise(st + t);
    float n2 = noise(st * 2.0 - t);
    float n3 = noise(st * 4.0 + t * 0.5);
    
    float finalNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    float pattern = wave * finalNoise;
    
    float grain = random(vUv + uTime) * 0.1;
    
    float threshold = smoothstep(0.4, 0.6, pattern + grain);
    
    gl_FragColor = vec4(vec3(threshold), 1.0);
  }
`

function WaveShader() {
  const meshRef = useRef<Mesh>(null)
  const { viewport } = useThree()
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as ShaderMaterial
      material.uniforms.uTime.value = state.clock.getElapsedTime()
      material.uniforms.uResolution.value.set(viewport.width, viewport.height)
    }
  })

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new Vector2() }
        }}
      />
    </mesh>
  )
}

export default function Scene() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Canvas frameloop="always">
        <WaveShader />
      </Canvas>
    </div>
  )
}

