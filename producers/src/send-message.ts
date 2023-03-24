import express from 'express'
import { kafkajsProducer } from './kafkajs-producer'
import { rdkafkaProducer } from './rdkafka-producer'

const router = express.Router()

kafkajsProducer.connect()
rdkafkaProducer.connect()

class MessageBody {
  message: object

  constructor(event: object) {
    this.message = event;
  }
}

router.post('/rdkafka', async (req, res) => {
  const messageBody = new MessageBody({
    a: Math.random(),
    b: Math.random(),
    c: Math.random(),
  });
  await rdkafkaProducer.produce(
    'test',
    null,
    Buffer.from(JSON.stringify(messageBody))
  )

  console.log('Sended rdkafka message:', messageBody)
  res.send('CREATED')
})

router.post('/', async (req, res) => {
  const messageBody = new MessageBody({
    a: Math.random(),
    b: Math.random(),
    c: Math.random(),
  });
  await kafkajsProducer.send({
    topic: 'test',
    messages: [
      {
        value: JSON.stringify(messageBody)
      },
    ],
  })

  console.log('Sended kafkajs message:', messageBody)
  res.send('CREATED')
})

export { router }
