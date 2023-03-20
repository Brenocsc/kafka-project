import express from 'express'
import { kafkaClient } from './kafka-client'

const router = express.Router()
const producer = kafkaClient.producer()

class MessageBody {
  message: object

  constructor(event: object) {
    this.message = event;
  }
}

router.post('/', async (req, res) => {
  await producer.connect()
  const messageBody = new MessageBody({
    a: Math.random(),
    b: Math.random(),
    c: Math.random(),
  });
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
