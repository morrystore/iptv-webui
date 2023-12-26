import express from "express";
import cors from "cors"
import { Logger, Storage, Collection, File } from '@freearhey/core'
import { Stream, Category, Channel, Language, Country, Region, Subdivision } from '../../scripts/models'
import { PlaylistParser } from '../../scripts/core'
import { STREAMS_DIR, DATA_DIR } from '../../scripts/constants'

// Create a new express application instance
const app: express.Application = express();
app.use(cors())


async function loadStreams({
  channels,
  categories,
  languages,
  countries
}: {
  channels: Collection
  categories: Collection
  languages: Collection,
  countries: Collection
}) {
  const groupedChannels = channels.keyBy(channel => channel.id)
  const groupedCategories = categories.keyBy(category => category.id)
  const groupedLanguages = languages.keyBy(language => language.code)
  const countryMap = new Map()
  countries.forEach(item => {
    countryMap.set(item.code.toLowerCase(), item.name)
  })

  const storage = new Storage(STREAMS_DIR)
  const parser = new PlaylistParser({ storage })
  const files = await storage.list('**/*.m3u')
  let streams = await parser.parse(files)

  streams = streams
    .orderBy(
      [
        (stream: Stream) => stream.channel,
        (stream: Stream) => stream.timeshift,
        (stream: Stream) => parseInt(stream.quality.replace('p', '')),
        (stream: Stream) => stream.label
      ],
      ['asc', 'asc', 'desc', 'asc']
    )
    .map((stream: Stream) => {
      const channel: Channel | undefined = groupedChannels.get(stream.channel)

      if (channel) {
        const channelCategories = channel.categories
          .map((id: string) => groupedCategories.get(id))
          .filter(Boolean)
        const channelLanguages = channel.languages
          .map((id: string) => groupedLanguages.get(id))
          .filter(Boolean)

        stream.categories = channelCategories
        stream.languages = channelLanguages
        stream.broadcastArea = channel.broadcastArea
        stream.isNSFW = channel.isNSFW
        if (channel.logo) stream.logo = channel.logo
      } else {
        const file = new File(stream.filepath)
        const [_, countryCode] = file.name().match(/^([a-z]{2})(_|$)/) || [null, null]
        const defaultBroadcastArea = countryCode ? [`c/${countryCode.toUpperCase()}`] : []

        stream.broadcastArea = new Collection(defaultBroadcastArea)
      }

      if(stream.filepath) {
        const key = stream.filepath.replace(".m3u", "").split("_")[0]
        stream.country = countryMap.get(key)
      }

      return stream
    })

  return streams
}

async function init() {
  const logger = new Logger()
  const dataStorage = new Storage(DATA_DIR)

  logger.info('loading data from api...')
  const channelsContent = await dataStorage.json('channels.json')
  const channels = new Collection(channelsContent).map(data => new Channel(data))
  const categoriesContent = await dataStorage.json('categories.json')
  const categories = new Collection(categoriesContent).map(data => new Category(data))
  const countriesContent = await dataStorage.json('countries.json')
  const countries = new Collection(countriesContent).map(data => new Country(data))
  const languagesContent = await dataStorage.json('languages.json')
  const languages = new Collection(languagesContent).map(data => new Language(data))
  const regionsContent = await dataStorage.json('regions.json')
  const regions = new Collection(regionsContent).map(data => new Region(data))
  const subdivisionsContent = await dataStorage.json('subdivisions.json')
  const subdivisions = new Collection(subdivisionsContent).map(data => new Subdivision(data))

  logger.info('loading streams...')
  let streams = await loadStreams({ channels, categories, languages , countries})

  return streams
}



app.get('/', async (_, res) => {
  let sm = await init()
  res.send(sm.toJSON())
});

const args = require('minimist')(process.argv.slice(2))
const port = args["port"]
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
