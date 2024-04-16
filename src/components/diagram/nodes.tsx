// @ts-nocheck
'use client'

import * as THREE from 'three'
import {
  createContext,
  useMemo,
  useRef,
  useState,
  useContext,
  useLayoutEffect,
  forwardRef,
  useEffect,
  useCallback,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  QuadraticBezierLine,
  Text,
  Circle as DreiCircle,
} from '@react-three/drei'
import { useDrag } from '@use-gesture/react'

const context = createContext()
const Circle = forwardRef(
  (
    {
      children,
      opacity = 1,
      radius = 0.05,
      segments = 32,
      color = '#ff1050',
      ...props
    },
    ref
  ) => (
    <mesh ref={ref} {...props}>
      <circleGeometry args={[radius, segments]} />
      <meshBasicMaterial
        transparent={opacity < 1}
        opacity={opacity}
        color={color}
      />
      {children}
    </mesh>
  )
)

export function Nodes({ children }) {
  const group = useRef()
  const { viewport } = useThree()
  const [nodes, set] = useState([])
  const lines = useMemo(() => {
    let childLines = []
    for (let node of nodes)
      node.connectedTo
        .map((ref) => [node.position, ref?.current?.position])
        .forEach(([start, end]) =>
          childLines.push({
            start: start.clone().add({ x: 0.35, y: 0, z: 0 }),
            end: end.clone().add({ x: -0.35, y: 0, z: 0 }),
          })
        )
    return childLines
  }, [nodes])

  useFrame((_, delta) =>
    group.current.children.forEach(
      (group) =>
        (group.children[0].material.uniforms.dashOffset.value -= delta * 10)
    )
  )

  return (
    <context.Provider value={set}>
      <group ref={group}>
        {lines.map((line, index) => (
          <group>
            <QuadraticBezierLine
              key={index}
              {...line}
              color='white'
              dashed
              dashScale={50}
              gapSize={20}
            />
            <QuadraticBezierLine
              key={index}
              {...line}
              color='white'
              lineWidth={0.5}
              transparent
              opacity={0.1}
            />
          </group>
        ))}
      </group>
      {children}
      {lines.map(({ start, end }, index) => (
        <group key={index} position-z={1}>
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </context.Provider>
  )
}

export const Node = forwardRef(
  (
    {
      color = 'black',
      name,
      connectedTo = [],
      position = [0, 0, 0],
      rootType,
      fetchConnections,
      id,
      child,
      ...props
    },
    ref
  ) => {
    const set = useContext(context)
    const { size, camera } = useThree()
    const [pos, setPos] = useState(() => new THREE.Vector3(...position))
    const state = useMemo(
      () => ({ position: pos, connectedTo }),
      [pos, connectedTo]
    )
    // Register this node on mount, unregister on unmount
    useLayoutEffect(() => {
      set((nodes) => [...nodes, state])
      return () => void set((nodes) => nodes.filter((n) => n !== state))
    }, [state, pos])
    // Drag n drop, hover
    const [hovered, setHovered] = useState(false)
    useEffect(
      () => void (document.body.style.cursor = hovered ? 'grab' : 'auto'),
      [hovered]
    )
    const bind = useDrag(({ down, xy: [x, y] }) => {
      document.body.style.cursor = down ? 'grabbing' : 'grab'
      setPos(
        new THREE.Vector3(
          (x / size.width) * 2 - 1,
          -(y / size.height) * 2 + 1,
          0
        )
          .unproject(camera)
          .multiply({ x: 1, y: 1, z: 0 })
          .clone()
      )
    })

    return (
      <Circle
        ref={ref}
        {...bind()}
        opacity={0.2}
        radius={child ? 0.5 : 1}
        color={color}
        position={pos}
        {...props}
      >
        <Circle
          radius={child ? 0.25 : 0.5}
          position={[0, 0, 0.1]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          color={hovered ? '#ff1050' : color}
        >
          <Text position={[0, 0, 1]} fontSize={child ? 0.2 : 0.35}>
            {name}
          </Text>
        </Circle>
      </Circle>
    )
  }
)

// import * as THREE from 'three'
// import {
//   createContext,
//   useMemo,
//   useRef,
//   useState,
//   useContext,
//   useLayoutEffect,
//   forwardRef,
//   useEffect,
// } from 'react'
// import { useFrame, useThree } from '@react-three/fiber'
// import { QuadraticBezierLine, Text } from '@react-three/drei'
// import { useDrag } from '@use-gesture/react'

// const NodeContext = createContext()
// const context = createContext()

// const Circle = forwardRef(
//   (
//     {
//       children,
//       opacity = 1,
//       radius = 0.05,
//       segments = 32,
//       color = '#ff1050',
//       ...props
//     },
//     ref
//   ) => (
//     <mesh ref={ref} {...props}>
//       <circleGeometry args={[radius, segments]} />
//       <meshBasicMaterial
//         transparent={opacity < 1}
//         opacity={opacity}
//         color={color}
//       />
//       {children}
//     </mesh>
//   )
// )

// export function Nodes({ children }) {
//   const group = useRef()
//   const [nodes, setNodes] = useState([])

//   const addNode = (node) => {
//     setNodes((prevNodes) => [...prevNodes, node])
//   }

//   const updateNode = (updatedNode) => {
//     setNodes((prevNodes) =>
//       prevNodes.map((node) => (node.id === updatedNode.id ? updatedNode : node))
//     )
//   }

//   const lines = useMemo(() => {
//     return nodes.flatMap((node) =>
//       node.connectedTo.map((ref) => ({
//         start: node.position.clone().add(new THREE.Vector3(0.35, 0, 0)),
//         end: ref.current.position.clone().add(new THREE.Vector3(-0.35, 0, 0)),
//       }))
//     )
//   }, [nodes])

//   useFrame((_, delta) =>
//     group.current.children.forEach(
//       (group) =>
//         (group.children[0].material.uniforms.dashOffset.value -= delta * 10)
//     )
//   )

//   return (
//     <NodeContext.Provider value={{ addNode, updateNode, nodes, setNodes }}>
//       <group ref={group}>
//         {lines.map((line, index) => (
//           <group>
//             <QuadraticBezierLine
//               key={index}
//               {...line}
//               color='white'
//               dashed
//               dashScale={50}
//               gapSize={20}
//             />
//             <QuadraticBezierLine
//               key={index}
//               {...line}
//               color='white'
//               lineWidth={0.5}
//               transparent
//               opacity={0.1}
//             />
//           </group>
//         ))}
//       </group>
//       {children}
//       {lines.map(({ start, end }, index) => (
//         <group key={index} position-z={1}>
//           <Circle position={start} />
//           <Circle position={end} />
//         </group>
//       ))}
//     </NodeContext.Provider>
//   )
// }

// export const Node = forwardRef(
//   (
//     {
//       id,
//       color = 'black',
//       name,
//       connectedTo = [],
//       position = [0, 0, 0],
//       ...props
//     },
//     ref
//   ) => {
//     const { addNode, updateNode, setNodes } = useContext(NodeContext)
//     const { size, camera } = useThree()
//     const [pos, setPos] = useState(() => new THREE.Vector3(...position))

//     const nodeState = useMemo(
//       () => ({ id, position: pos, connectedTo }),
//       [id, pos, connectedTo]
//     )

//     useLayoutEffect(() => {
//       addNode(nodeState)
//       return () => void setNodes({ ...nodeState, connectedTo: [] })
//     }, [])

//     const bind = useDrag(({ down, xy: [x, y] }) => {
//       document.body.style.cursor = down ? 'grabbing' : 'grab'
//       const newPos = new THREE.Vector3(
//         (x / size.width) * 2 - 1,
//         -(y / size.height) * 2 + 1,
//         0
//       )
//         .unproject(camera)
//         .multiply(new THREE.Vector3(1, 1, 0))
//       setPos(newPos)
//       updateNode({ ...nodeState, position: newPos })
//     })

//     return (
//       <Circle
//         ref={ref}
//         {...bind()}
//         opacity={0.2}
//         radius={0.5}
//         color={color}
//         position={pos}
//         {...props}
//       >
//         <Circle
//           radius={0.25}
//           position={[0, 0, 0.1]}
//           onPointerOver={() => (document.body.style.cursor = 'pointer')}
//           onPointerOut={() => (document.body.style.cursor = 'auto')}
//           color={color}
//         >
//           <Text position={[0, 0, 1]} fontSize={0.25}>
//             {name}
//           </Text>
//         </Circle>
//       </Circle>
//     )
//   }
// )