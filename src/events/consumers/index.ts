import { kafka } from "../index";
export const consumer = kafka.consumer({groupId: "user-auth-service-group"});

consumer.connect().then(() => {
    console.log("Kafka consumer connected");
}).catch((error) => {
    console.error(error);
    console.error("Kafka consumer failed to connect");
});