import * as crypto from "crypto";
import { Schema, Document, model } from "mongoose";
import * as jwt from "jsonwebtoken";
import { SESSION_SECRET } from "../utils/secrets";

export enum UserRole {
    "Admin" = "Admin",
    "User" = "User"
}

export interface IUserModel extends Document {
    email?: string;
    emailVerified: boolean;
    mobilePhoneNumber: string;
    role: UserRole;
    hash: string;
    salt: string;
    username: string;
    profile: {
        firstName: string;
        lastName: string;
        picture?: string;
        coverImage?: string;
    };
    facebook: {
        id: string;
        token: string;
    };
    linkedIn: {
        id: string;
        token: string;
        linkedInPic?: string;
    };
    validPassword: (candidatePassword: string) => boolean;
    setPassword: (password: string) => undefined;
    gravatar: (size?: number) => string;
    generateJwt: () => string;
}

export type AuthToken = {
    accessToken: string;
    kind: string;
};

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            match: /^.+@.+\..+$/,
            trim: true
        },
        mobilePhoneNumber: {
            type: String,
            trim: true
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            required: true,
            enum: [UserRole.Admin, UserRole.User],
            default: UserRole.User
        },
        hash: String,
        salt: String,
        profile: {
            firstName: {
                type: String,
                trim: true,
                required: true
            },
            lastName: {
                type: String,
                trim: true
            },
            picture: {
                type: String
            },
            coverImage: {
                type: String
            }
        },
        username: {
            type: String
        },
        facebook: {
            id: {
                type: String
            },
            token: {
                type: String
            }
        },
        linkedIn: {
            id: {
                type: String
            },
            token: {
                type: String
            },
            linkedInPic: {
                type: String
            }
        }
    },
    {timestamps: true}
);

userSchema.index({"$**": "text"});

userSchema.methods.validPassword = function (password: string) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha256")
        .toString("hex");
    return this.hash === hash;
};
userSchema.methods.setPassword = function (password: string) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha256")
        .toString("hex");
};
userSchema.methods.gravatar = function (size?: number) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=mp`;
    }
    const md5 = crypto
        .createHash("md5")
        .update(this.email)
        .digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=mp`;
};
userSchema.methods.generateJwt = function () {
    if (!SESSION_SECRET) {
        console.log("Missing SESSION_SECRET from environment variable");
        return;
    }
    const currentDateTime = new Date();
    const expiry = new Date(currentDateTime.getTime() + 15 * 60000); // Setting expiry for 15 minutes

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            exp: expiry.getTime() / 1000
        },
        SESSION_SECRET
    ); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

const User = model<IUserModel>("User", userSchema);
export default User;
