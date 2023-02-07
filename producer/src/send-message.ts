import express from 'express'
import { producer } from './kafka-producer'

const router = express.Router()

router.post('/', async (req, res) => {
  // await producer.connect()
  // await producer.send({
  //   topic: 'test-topic',
  //   messages: [
  //     { value: 'Hello KafkaJS user!' },
  //   ],
  // })

  console.log('done')
  res.send('CREATED')
})

export { router }
