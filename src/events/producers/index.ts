import { kafka } from "../index";
export const producer = kafka.producer();

producer.connect().then(() => {
    console.log("Kafka producer connected");
}).catch((error) => {
    console.error(error);
    console.error("Kafka producer failed to connect");
});

export const stringifyMessageObject = (object: Object) => {
    try {
        return JSON.stringify(object);
    } catch (error) {
        throw error;
    }
};
