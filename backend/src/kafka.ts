import { Kafka } from 'kafkajs';

export function createKafkaClient() {
  const kafka = new Kafka({
    clientId: 'trading-backend',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  return kafka;
}


