import { Kafka } from 'kafkajs'

const kafkaClient = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

export { kafkaClient }
