import express from 'express'
import { kafkaClient } from './kafka-client'

const router = express.Router()
const producer = kafkaClient.producer()

router.post('/', async (req, res) => {
  await producer.connect()
  await producer.send({
    topic: 'test',
    messages: [
      { value: req.body.message },
    ],
  })

  console.log('Sended message:', { value: req.body.message })
  res.send('CREATED')
})

export { router }
