import * as express from "express";
import { v1ApiRouter } from "./v1";


export class ApiRouter {
    router: express.Router;

    init() {
        this.router.get("/", (req, res) => {
            res.status(200).json({
                "message": "This route serves different versions of api",
                "childRoutes": {
                    "v1": "serves version 1.0 of api"
                }
            });
        });
        this.router.use("/v1", v1ApiRouter);
    }
    constructor() {
        this.router = express.Router();
        this.init();
    }
}
const initialRouter = new ApiRouter();
export const apiRouter = initialRouter.router;
