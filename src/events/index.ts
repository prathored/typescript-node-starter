import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "user-auth-service",
  brokers: ["0.0.0.0:9092"]
});



