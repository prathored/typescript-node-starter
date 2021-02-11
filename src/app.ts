import express from "express";
import { Request, Response, NextFunction } from "express";
import { Server } from "http";
import bodyParser = require("body-parser");
import compression from "compression";
import expressValidator from "express-validator";
import { apiRouter } from "./api";
import * as path from "path";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import { MONGODB_URI } from "./utils/secrets";
import bluebird from "bluebird";

export class ExpressApp {
    public app: express.Application;
    public static bootstrap(): Server {
        return new Server();
    }
    constructor() {
        this.app = express();
        this.config();
        this.api();
        this.errorHandler();
    }

    public api() {
        this.app.use("/", apiRouter);
    }
    public config() {
        this.app.use(morgan("combined"));
        // this.app.use(morgan("tiny"));
        this.app.use(cors());
        // Connect to MongoDB
        const mongoUrl = MONGODB_URI;
        if (!mongoUrl) {
            console.log("MongoDB URL not present in env");
            return;
        }
        (<any>mongoose).Promise = bluebird;
        mongoose.connect(mongoUrl).then(() => {
            // console.log("Mongoose connected to: ", mongoUrl);
        }).catch(err => {
            console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
            process.exit();
        });

        // Express configuration
        this.app.set("port", process.env.PORT || 8080);
        this.app.use(compression());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }
    public errorHandler() {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            if (error.name === "UnauthorizedError") {
                res.status(401);
                res.json({ "message": error.name });
            }
        });
    }
}
