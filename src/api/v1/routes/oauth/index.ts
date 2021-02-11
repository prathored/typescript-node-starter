import * as express from "express";
import * as oauthController from "../../controllers/oauth/index";
import { checkSchema } from "express-validator";

export class OauthRouter {
    router: express.Router;
    init() {
        this.router.post("/token", checkSchema(oauthController.generateAuthTokenValidationSchema), oauthController.generateAuthToken);

        this.router.post("/revoke", checkSchema(oauthController.revokeRefreshTokenValidationSchema), oauthController.revokeRefreshToken);
    }
    /**
     * Initialize the CrudRouter
     */
    constructor() {
        this.router = express.Router();
        this.init();
    }
}
const initialRouter = new OauthRouter();
initialRouter.init();
export const oauthRouter = initialRouter.router;
