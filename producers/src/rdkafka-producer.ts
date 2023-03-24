import Kafka from 'node-rdkafka'

const rdkafkaProducer = new Kafka.Producer({
  'metadata.broker.list': 'localhost:9093',
  'linger.ms': '60000',
  'batch.size': 1000
})

export { rdkafkaProducer }
