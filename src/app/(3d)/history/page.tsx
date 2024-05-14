const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

import { ThreeDScrollThrough } from '@/components/3d/3d-scroll-through'
import Scroll from '@/features/3d/templates/Scroll'
import { getXataClient } from '@/lib/xata'

const xata = getXataClient()

export default async function Index() {
  const records: any = await xata.db.events
    .sort('date', 'desc')
    .select([
      'name',
      'description',
      'location',
      'latitude',
      'longitude',
      'date',
      'photos',
      'photos.signedUrl',
      'photos.enablePublicUrl',
      {
        name: '<-event-subject-matter-experts.event',
        columns: ['*'],
        as: 'experts',
      },
    ])
    .getAll()

  const expertPersonnel = await xata.db['event-subject-matter-experts']
    .select([
      'event.id',
      'subject-matter-expert.id',
      'subject-matter-expert.name',
      'subject-matter-expert.photo',
    ])
    .getAll()

  const personnel = expertPersonnel
    .toSerializable()
    .map(({ event, id, xata: xataMeta, ...rest }) => ({
      ...rest['subject-matter-expert'],
      eventId: event?.id,
    }))

  const data = records.toSerializable()

  const events = data.map((event: { experts: { records: any[] } }) => {
    if (event?.experts?.records) {
      const experts = event.experts.records.map((expert) => expert)
      return {
        ...event,
        experts,
      }
    }
    return event
  })

  const removeEmptyKeys = (obj: any) => {
    const newObj: any = {}
    for (let key in obj) {
      if (obj[key] && obj[key].length) {
        newObj[key] = obj[key]
      }
    }
    return newObj
  }
  function removeLeadingZero(input) {
    const str = String(input)
    return str.startsWith('0') ? str.slice(1) : str
  }

  const eventsByYear: any = removeEmptyKeys(
    events.reduce((acc: any, item: any) => {
      const year: any = removeLeadingZero(item.date.split('-')[0]) // dayjs.utc(new Date(date)).getYear()
      console.log('year: ', year)

      if (acc[year]) {
        acc[year].push(item)
      } else {
        acc[year] = []
        acc[year].push(item)
      }
      return acc
    }, {})
  )

  const years = Object.keys(eventsByYear)

  return (
    <ThreeDScrollThrough years={years} events={events} keyFigures={personnel} />
  )
}
