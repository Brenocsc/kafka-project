import { Kafka } from 'kafkajs'

const kafkajsClient = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9093']
})

const kafkajsProducer = kafkajsClient.producer()

export { kafkajsProducer }
