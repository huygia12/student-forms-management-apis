import config from "@/common/app-config";
import ExpressServer from "./express-server";

export default () => {
    const expressServer = new ExpressServer(config.SERVER_PORT);

    process
        .on("exit", () => {
            expressServer.close();
        })
        .on("SIGINT", () => {
            expressServer.close();
        });
};
