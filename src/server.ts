import errorHandler from "errorhandler";
import { ExpressApp } from "./app";
import * as http from "http";

const app = new ExpressApp().app;
const server = http.createServer(app);
/**
 * Error Handler. Provide full stact - remove for production
 */
app.use(errorHandler());
server.listen(app.get("port"));
server.on("error", (err: Error) => {
    console.log("  Error starting server", err);
});
server.on("listening", () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});
/**
 * Start Express Server
 */
// const server = app.listen(app.get("port"), () => {
//     console.log("App is running at http://localhost:%d in %s mode",
//         app.get("port"),
//         app.get("env")
//     );
//     console.log("Press CTRL-C to stop");
// });
// export default server;
