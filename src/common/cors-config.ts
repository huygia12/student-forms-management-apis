import {CorsOptions} from "cors";

const localhost = "http://127.0.0.1";
const whiteList = [];

let counter = 1;
let clientDomain = process.env[`CLIENT_DOMAIN_${counter}`];
let clientPort = process.env[`CLIENT_PORT_${counter}`];

while (clientDomain || clientPort) {
    clientDomain && whiteList.push(clientDomain);
    clientPort && whiteList.push(`${localhost}:${clientPort}`);

    ++counter;
    clientDomain = process.env[`CLIENT_DOMAIN_${counter}`];
    clientPort = process.env[`CLIENT_PORT_${counter}`];
}

export const options: CorsOptions = {
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
        "Authorization" as const,
        "Accept",
        "Content-Type",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    exposedHeaders: [
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
    ],
    optionsSuccessStatus: 200,
    credentials: true,
    origin: [...whiteList, `https://admin.socket.io`],
};
