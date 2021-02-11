import { Request, Response } from "express";
import { default as User, IUserModel } from "../../../../models/user";
import { Schema, validationResult } from "express-validator";
import {
    passportConfig
} from "../../../../config/passport";
import { default as RefreshToken } from "../../../../models/refresh-token";
// import { } from "../../../../events/producers/users";

export const generateAuthTokenValidationSchema: Schema = {
    grantType: {
        in: "body",
        matches: {
            options: /(^password$)|(^refreshToken$)/
        },
        errorMessage: "Grant type should be either password or refresh token.",
    },
    password: {
        in: "body",
        custom: {
            options: (value, { req, location, path }) => {
                console.log(value, req.body, location, path);
                if (req.body.grantType === "refreshToken") {
                    if (value !== undefined) {
                        throw Error("Password cannot be passed with refreshToken grant type.");
                    } else {
                        return true;
                    }
                } else if (req.body.grantType === "password") {
                    if (!value) {
                        throw Error("Password is required with password grant type.");
                    } else {
                        return value;
                    }
                } else {
                    return true;
                }
            }
        }
    },
    email: {
        in: "body",
        custom: {
            options: (value, { req, location, path }) => {
                if (req.body.grantType === "refreshToken") {
                    if (value !== undefined) {
                        throw Error("Email cannot be passed with refreshToken grant type.");
                    } else {
                        return true;
                    }
                } else if (req.body.grantType === "password") {
                    if (!value) {
                        throw Error("Email is required with password grant type.");
                    } else {
                        return value;
                    }
                } else {
                    return true;
                }
            }
        }
    },
    refreshToken: {
        in: "body",
        custom: {
            options: (value, { req, location, path }) => {
                if (req.body.grantType === "refreshToken") {
                    if (!value) {
                        throw Error("Refresh Token missing with refreshToken grant type.");
                    } else {
                        return value;
                    }
                } else if (req.body.grantType === "password") {
                    if (value !== undefined) {
                        throw Error("Refresh Token is not required with password grant type.");
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
};

export const generateAuthToken = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    if (req.body.grantType === "password") {
        passportConfig.passport.authenticate("local", function (err, user, info) {
            if (err) {
                return res.status(404).json({
                    errors: [{
                        code: err.code,
                        msg: "User not found"
                    }]
                });
            }
            if (!user) {
                res.status(401).json({
                    errors: [{
                        msg: info.message
                    }]
                });
            }
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
        })(req, res);
    } else if (req.body.grantType === "refreshToken") {
        RefreshToken.findOne({ token: req.body.refreshToken }).then((refreshToken) => {
            if (!refreshToken) {
                return res.status(401).json({
                    errors: [{
                        msg: "Invalid or expired refresh token",
                    }]
                });
            }
            User.findById(refreshToken.user).then((user) => {
                if (!user) {
                    return res.status(401).json({
                        errors: [{
                            msg: "Invalid or expired refresh token",
                        }]
                    });
                }
                const accessToken = user.generateJwt();
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
                return res.status(500).json({
                    errors: [{
                        msg: "Server side error."
                    }]
                });
            });
        }).catch((error) => {
            console.error(error);
            return res.status(500).json({
                errors: [{
                    msg: "Server side error."
                }]
            });
        });
    }
};


export const revokeRefreshTokenValidationSchema: Schema = {
    refreshToken: {
        in: "body",
        isString: true,
        errorMessage: "Refresh token is required."
    }
};


export const revokeRefreshToken = (req: Request, res: Response) => {
    RefreshToken.findOneAndDelete({token: req.body.refreshToken}).then((refreshToken) => {
        return res.status(200).json({});
    }).catch((error) => {
        console.error(error);
        return res.status(500).json({
            errors: [{
                msg: "Server side error."
            }]
        });
    });
};