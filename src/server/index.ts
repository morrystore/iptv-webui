import express from "express";
import cors from "cors"
import {getStreams,addBadUrl,removeBadUrl} from './steamReader'

const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Create a new express application instance
const app: express.Application = express();
app.use(cors())
app.use(express.json())


app.get('/', async (_, res) => {
  let streams = await getStreams()
  res.send(streams.toJSON())
});

app.post('/addBadUrl', async (req, res) => {
  let streams = await addBadUrl(req.body.url)
  res.send({act:"ok"})
});

app.post('/removeBadUrl', async (req, res) => {
  let streams = await removeBadUrl(req.body.url)
  res.send({act:"ok"})
});

app.post('/updateStreams', async (req, res) => {
  await exec('yarn api:load');
  await exec('yarn playlist:update');
  res.send({act:"ok"})
});

const args = require('minimist')(process.argv.slice(2))
const port = args["port"]
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
