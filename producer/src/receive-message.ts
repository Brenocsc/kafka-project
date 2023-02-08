
import { kafkaClient } from './kafka-client'

const receiveMessage = async (consumerId: number, groupId: string) => {
  const consumer = kafkaClient.consumer({ groupId })

  await consumer.connect()
  await consumer.subscribe({ topic: 'test', fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        consumerId,
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      })
    },
  })
}

export { receiveMessage }
