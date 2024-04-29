import {
  getTopicPersonnelAndEventGraphData,
  TopicPersonnelAndEventGraphDataPayload,
} from '@/lib/xata'

// import { Graph } from '@/components/visualizations/graph'
import { Suspense } from 'react'
import { Spherical3DGraph } from '@/components/visualizations/3d-graph/spherical-3d-graph'

export default async function Index() {
  const data: TopicPersonnelAndEventGraphDataPayload =
    await getTopicPersonnelAndEventGraphData()

  const models = {
    events: {
      // @ts-ignore
      all: data?.events?.all.toSerializable(),
      // @ts-ignore
      withConnections: data?.events?.withConnections,
    },
    topics: {
      // @ts-ignore
      all: data?.topics?.all.toSerializable(),
      // @ts-ignore
      withConnections: data?.topics?.withConnections,
    },

    personnel: data?.personnel?.all,
  }
  // {/* <Graph models={models} /> */}

  return (
    <Suspense>
      <Spherical3DGraph models={models} />
    </Suspense>
  )
}
