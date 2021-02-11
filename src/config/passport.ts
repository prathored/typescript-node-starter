import * as passport from "passport";
import * as passportLocal from "passport-local";
import { IUserModel } from "../models/user";
import { default as User } from "../models/user";
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { SESSION_SECRET } from "../utils/secrets";

const LocalStrategy = passportLocal.Strategy;

import { Passport } from "passport";

export class PassportConfig {
    passport: passport.Authenticator;

    constructor() {
        this.passport = new Passport();
        this.passport.use(new LocalStrategy({
            usernameField: "email"
        }, (email, password, done) => {
            User.findOne({email: email.toLowerCase()}, (err, user: IUserModel) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(undefined, false, {message: `Email ${email} not found.`});
                }
                if (user.validPassword(password)) {
                    return done(undefined, user);
                }
                return done(undefined, false, {message: "Invalid email or password."});
            });
        }));
        this.passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => {
                if (!user) {
                    done(err, undefined);
                    return;
                }
                done(err, user);
            });
        });
        this.passport.serializeUser<any, any>((user, done) => {
            done(undefined, user.id);
        });
    }

    apiAuthCheck(strict = true) {
        const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
            let token;
            if (req.headers && req.headers.authorization && (typeof req.headers.authorization === "string")) {
                const parts = req.headers.authorization.split(" ");
                if (parts.length == 2) {
                    const scheme = parts[0];
                    const credentials = parts[1];
                    if (/^Bearer$/i.test(scheme)) {
                        token = credentials;
                    } else {
                        if (strict) {
                            // return next(new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' }));
                            return res.status(401).json({
                                "errors": [{
                                    "code": "TokenBadSchemeError",
                                    "msg": "Format is Authorization: Bearer [token]"
                                }]
                            });
                        } else {
                            return next();
                        }
                    }
                    jwt.verify(token, SESSION_SECRET, function (err: any, decoded: any) {
                        if (err) {
                            console.log(err);
                            return res.status(401).json({
                                "errors": [{
                                    "code": err.name,
                                    "msg": "Invalid authorization token"
                                }]
                            });
                        }
                        req.user = decoded;
                        next();
                    });
                } else {
                    return res.status(401).json({
                        "errors": [{
                            "msg": "Format is Authorization: Bearer [token]"
                        }]
                    });
                }
            } else {
                if (strict) {
                    return res.status(401).json({
                        "errors": [{
                            "msg": "No authorization token was found"
                        }]
                    });
                } else {
                    return  next();
                }
            }
        };
        return jwtMiddleware;
    }

    isAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }
}

export interface IAuthenticatedRequest extends Request {
    payload: {
        _id: string;
        email: string;
    };
}
export const passportConfig = new PassportConfig();
