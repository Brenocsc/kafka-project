import express from 'express';
import { router } from './send-message'
import bodyParser from 'body-parser'

const app = express()
const port = 3000

app.use(bodyParser.json())

app.use(router)

app.listen(port, () => {
  console.log(`Kafka Producer listening on port ${port}`)
})
