'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeToolbar } from 'reactflow'

const labelStyle = {
  position: 'absolute',
  color: '#555',
  bottom: -15,
  fontSize: 8,
}

const ToolbarNode = memo(({ data }: any) => {
  const [emoji, setEmoji] = useState(() => '🚀')

  return (
    <>
      <NodeToolbar isVisible>
        <button onClick={() => setEmoji('🚀')}>🚀</button>
        <button onClick={() => setEmoji('🔥')}>🔥</button>
        <button onClick={() => setEmoji('✨')}>✨</button>
      </NodeToolbar>
      <div style={{ padding: '10px 20px' }}>
        <div>{emoji}</div>
      </div>
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Right} />

      <div style={labelStyle}>{data.label}</div>
    </>
  )
})

ToolbarNode.displayName = 'ToolbarNode'

export { ToolbarNode }
