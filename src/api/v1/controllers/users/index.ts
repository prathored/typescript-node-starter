import { Request, Response } from "express";
import { default as User, IUserModel } from "../../../../models/user";
import { default as RefreshToken } from "../../../../models/refresh-token";
import { Schema, validationResult } from "express-validator";
import { userRegisteredEvent } from "../../../../events/producers/users";
export const createUserValidationSchema: Schema = {
    email: {
        in: "body",
        isEmail: true,
        errorMessage: "Please enter a valid email address."
    },
    password: {
        in: "body",
        matches: {
            errorMessage: "Password should be at least 8 characters long.",
            options: /(?=.{8,})/
        }
    },
    firstName: {
        in: "body",
        isString: true,
        isLength: {
            options: {
                min: 1,
                max: 64
            },
            errorMessage: "First name should be maximum 64 characters long."
        },
        errorMessage: "First name is a required field.",
    },
    lastName: {
        in: "body",
        isString: true,
        isLength: {
            options: {
                min: 0,
                max: 64
            },
            errorMessage: "Last name should be maximum 64 characters long."
        },
        errorMessage: "Last name should be maximum 64 characters long."
    }
};

export let create = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    User.findOne({
        email: req.body.email
    }).then((existingUser: IUserModel) => {
        if (existingUser) {
            return res.status(500).json({
                "errors": [{
                    "msg": "An account already exists with the provided email address.",
                }]
            });
        }
        const user = new User({
            email: req.body.email,
            profile: {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        });
        user.setPassword(req.body.password);
        user.save().then((user) => {
            userRegisteredEvent(user).then((recordMetaData) => {
                const accessToken = user.generateJwt();
                const refreshToken = new RefreshToken({ user: user._id, requestedDeviceMeta: { headers: req.headers, ip: req.ip, ips: req.ips } });
                refreshToken.generateToken();
                refreshToken.save().then((refreshToken) => {
                    return res.status(200).json({
                        accessToken: accessToken,
                        refreshToken: refreshToken.token,
                        user: {
                            _id: user._id,
                            email: user.email,
                            profile: user.profile,
                            role: user.role,
                            mobilePhoneNumber: user.mobilePhoneNumber
                        }
                    });
                }).catch((error) => {
                    console.error(error);
                    console.error("Error generating refresh token");
                    return res.status(201).json({
                        accessToken: accessToken,
                        user: {
                            _id: user._id,
                            email: user.email,
                            profile: user.profile,
                            role: user.role,
                            mobilePhoneNumber: user.mobilePhoneNumber
                        }
                    });
                });
            }).catch((error) => {
                console.error(error);
                console.error("Failed to publish user registered event");
                const accessToken = user.generateJwt();
                const refreshToken = new RefreshToken({ user: user._id, requestedDeviceMeta: { headers: req.headers, ip: req.ip, ips: req.ips } });
                refreshToken.generateToken();
                refreshToken.save().then((refreshToken) => {
                    return res.status(201).json({
                        accessToken: accessToken,
                        refreshToken: refreshToken.token,
                        user: {
                            _id: user._id,
                            email: user.email,
                            profile: user.profile,
                            role: user.role,
                            mobilePhoneNumber: user.mobilePhoneNumber
                        }
                    });
                }).catch((error) => {
                    console.error(error);
                    console.error("Error generating refresh token");
                    return res.status(201).json({
                        accessToken: accessToken,
                        user: {
                            _id: user._id,
                            email: user.email,
                            profile: user.profile,
                            role: user.role,
                            mobilePhoneNumber: user.mobilePhoneNumber
                        }
                    });
                });
            });
        }).catch((error) => {
            console.error(error);
            return res.status(500).json({
                "errors": [{
                    "msg": "Server side error.",
                }]
            });
        });
    }).catch((error) => {
        console.error(error);
        return res.status(500).json({
            "errors": [{
                "msg": "Server side error.",
            }]
        });
    });
};


export const me = (req: Request & {user: {_id: string}}, res: Response) => {
    User.findById(req.user._id, "-hash -salt -facebook -linkedIn").then((user) => {
        const userAsObject = user.toObject();
        if (!user.profile.picture) {
            userAsObject.profile.picture = user.gravatar();
        }
        res.status(200).json(userAsObject);
    }).catch((error) => {
        console.error(error);
        return res.status(500).json({
            "errors": [{
                "msg": "Server side error.",
            }]
        });
    });
};