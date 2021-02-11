import { producer, stringifyMessageObject } from "./index";
import { IUserModel } from "../../models/user";

export const userRegisteredEvent = (user: IUserModel) => {
    const message = stringifyMessageObject({_id: user._id, email: user.email, profile: user.profile});
    return producer.send({
        topic: "user-registered",
        messages: [
            {value: message, key: "user"}
        ]
    });
};