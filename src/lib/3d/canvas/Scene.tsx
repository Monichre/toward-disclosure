'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'

import * as THREE from 'three'
import { r3f } from '@/features/3d/helpers/global'

export default function Scene({ ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}
    >
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}