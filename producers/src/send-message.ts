import express from 'express'
import { kafkaClient } from './kafka-client'

const router = express.Router()
const producer = kafkaClient.producer()

class MessageBody {
  event: string

  constructor(event: string) {
    this.event = event;
  }
}

router.post('/', async (req, res) => {
  await producer.connect()
  const messageBody = new MessageBody(req.body.message)
  await producer.send({
    topic: 'test',
    messages: [
      {
        value: JSON.stringify(messageBody)
      },
    ],
  })

  console.log('Sended message:', messageBody)
  res.send('CREATED')
})

export { router }
