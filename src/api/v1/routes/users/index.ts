import * as express from "express";
import * as userController from "../../controllers/users/index";
import { checkSchema } from "express-validator";
import { oauthRouter } from "../oauth";
import {
    passportConfig
} from "../../../../config/passport";

export class UserRouter {
    router: express.Router;
    init() {
        this.router.post("", checkSchema(userController.createUserValidationSchema), userController.create);
        this.router.get("/me", passportConfig.apiAuthCheck(true), userController.me);
        this.router.use("/oauth", oauthRouter);
    }
    /**
     * Initialize the CrudRouter
     */
    constructor() {
        this.router = express.Router();
        this.init();
    }
}
const initialRouter = new UserRouter();
initialRouter.init();
export const userRouter = initialRouter.router;
