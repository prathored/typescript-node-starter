import { Schema, Document, model } from "mongoose";
import { IUserModel } from "./user";
import * as crypto from "crypto";

export interface IRefreshTokenModel extends Document {
    user: Schema.Types.ObjectId | IUserModel;
    token: string;
    requestedDeviceMeta: any;
    createdAt: Date;
    generateToken: () => string;
}

const refreshTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    requestedDeviceMeta: {
        type: Schema.Types.Mixed
    }
}, {timestamps: true});

refreshTokenSchema.index({"$**": "text"});
refreshTokenSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 2592000 }); // 2592000 seconds = 30 days

refreshTokenSchema.methods.generateToken = function () {
    if (!this.token) {
        this.token = crypto.randomBytes(64).toString("hex");
    }
};

const RefreshToken = model<IRefreshTokenModel>("RefreshToken", refreshTokenSchema);
export default RefreshToken;
