import * as express from "express";
import { userRouter } from "./routes/users";

export class V1ApiRouter {
    router: express.Router;
    init() {
        // define all routes here
         this.router.use("/", userRouter);
    }
    constructor() {
        this.router = express.Router();
        this.init();
    }
}
const initialRouter = new V1ApiRouter();
initialRouter.init();
export const v1ApiRouter = initialRouter.router;
