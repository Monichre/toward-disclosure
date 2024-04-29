'use client'

import { TopicPersonnelAndEventGraphDataPayload } from '@/lib/xata'
import { DOMAIN_MODEL_COLORS } from '@/utils/colors'
import { useState, useEffect, useMemo } from 'react'
import { GraphNode, GraphEdge } from 'reagraph'

interface ModelNodesProps {
  models: TopicPersonnelAndEventGraphDataPayload
}

const rootNodes = [
  {
    label: 'topics',
    id: 'topics',
    fill: DOMAIN_MODEL_COLORS.topics,

    data: {
      x: 0,
      y: 1,
      size: 15,
      color: DOMAIN_MODEL_COLORS.topics,
    },
  },
  {
    label: 'events',
    id: 'events',
    fill: DOMAIN_MODEL_COLORS.events,
    data: {
      x: 0,
      y: 1,
      size: 15,
      color: DOMAIN_MODEL_COLORS.events,
    },
  },
  {
    label: 'personnel',
    id: 'personnel',
    fill: DOMAIN_MODEL_COLORS.personnel,
    data: {
      x: 0,
      y: 1,
      size: 15,
      color: DOMAIN_MODEL_COLORS.personnel,
    },
  },
]
const rootEdges: any = []

export const useModelNodes = ({ models }: ModelNodesProps) => {
  const {
    events: {
      all: allEventModels,
      withConnections: eventsSubjectMatterExpertsEdges,
    },
    topics: topicModels,
    personnel: personnelModels,
  }: any = models

  console.log(
    'eventsSubjectMatterExpertsEdges: ',
    eventsSubjectMatterExpertsEdges
  )

  const { all: allTopics, withConnections: topicsSubjectMatterExpertEdges } =
    topicModels

  const [topics, eventsRootNode, personnelRootNode]: any = rootNodes
  console.log('eventsRootNode: ', eventsRootNode)

  const [nodes, edges] = useMemo(() => {
    const tempNodes: any = rootNodes
    const tempEdges: any = rootEdges

    personnelModels.forEach(({ id, ...person }: any) => {
      const personnelNode: GraphNode = {
        id: id,
        label: person?.name,
        fill: DOMAIN_MODEL_COLORS.personnel,
        data: {
          ...person,
          color: DOMAIN_MODEL_COLORS.personnel,
          type: 'key figures',
          segment: 'key figures',
        },
      }
      tempNodes.push(personnelNode)
      const rootPersonnelToChildNodeEdge = {
        source: personnelRootNode.id,
        target: id,
        id: `${personnelRootNode.id}->${id}`,
        // label: `${personnelRootNode.id}->>${personnelNode.id}`,
      }
      tempEdges.push(rootPersonnelToChildNodeEdge)
    })

    allTopics.forEach(({ id, ...topic }: any) => {
      const topicNode: GraphNode = {
        id: id,
        label: topic?.name,

        fill: DOMAIN_MODEL_COLORS.topics,
        data: {
          ...topic,
          type: 'topic',
          segment: 'topics',
        },
      }
      tempNodes.push(topicNode)
      const rootTopicToChildTopicNodeEdge: GraphEdge = {
        source: topics.id,
        target: id,
        id: `${topics.id}->${id}`,
        // label: `${topics.id}->>${topicNode.id}`,
      }

      tempEdges.push(rootTopicToChildTopicNodeEdge)
    })

    topicsSubjectMatterExpertEdges.forEach((edge) => {
      if (edge?.topic && edge['subject-matter-expert']) {
        const newEdge = {
          source: edge['topic'].id,
          target: edge['subject-matter-expert'].id,
          id: edge?.id,
        }
        tempEdges.push(newEdge)
      }
    })

    eventsSubjectMatterExpertsEdges.forEach(({ id, event, ...rest }) => {
      console.log('event: ', event)
      console.log('event: ', event)
      const person = rest['subject-matter-expert']
      if (!tempNodes.find((node) => node?.id === person.id)) {
        const personnelNode: GraphNode = {
          id: person.id,
          label: person?.name,
          fill: DOMAIN_MODEL_COLORS.personnel,
          data: {
            ...person,
            type: 'key figures',
            segment: 'key figures',
          },
        }
        tempNodes.push(personnelNode)
      }
      const rootPersonnelToChildNodeEdge = {
        source: personnelRootNode.id,
        target: person.id,
        id: `${personnelRootNode.id}->${person.id}`,
      }
      tempEdges.push(rootPersonnelToChildNodeEdge)
      const eventNode = {
        id: event?.id,
        label: event?.name,
        fill: DOMAIN_MODEL_COLORS?.events,
        data: {
          ...event,
          type: 'event',
          segment: 'events',
        },
      }
      tempNodes.push(eventNode)
      const rootEventToChildEventEdge = {
        source: eventsRootNode?.id,
        target: event?.id,
        id: `${eventsRootNode.id}->${event.id}`,
      }
      const eventToPersonnelEdge = {
        source: event?.id,
        target: person.id,
        id: id,
      }

      tempEdges.push(rootEventToChildEventEdge)
      tempEdges.push(eventToPersonnelEdge)
    })

    return [tempNodes, tempEdges]
  }, [])

  return {
    nodes,
    edges,
  }
}
