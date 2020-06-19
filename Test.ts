import { Fetch } from "./Fetch";
import * as Fs from "fs";

(async () => {
    // echo test
    try {
        const
            testText = "hello",
            t = new Date().getTime(),
            json = await new Fetch("https://postman-echo.com/post").head("X-Time", t).fetch(testText, "text/plain"),
            obj = JSON.parse(json);

        if (!obj)
            console.log("empty response");
        else {
            if (obj.data !== testText)
                console.error("invalid data");
            else {
                if (!obj.headers || obj.headers["x-time"] != t)
                    console.error("invalid header");
                else
                    console.info("all ok");
            }
        }
    }
    catch (ex) {
        console.error(`exception: ${ex.message || ex}`);
    }

    // error test
    try {
        await new Fetch("https://postman-echo.com/status/500").fetch();
    }
    catch (ex) {
        if (ex.statusCode !== 500)
            console.error("error test failed");
        else
            console.info("error test ok");
    }

    // error map
    try {
        await new Fetch("https://postman-echo.com/status/500")
            .exMap((ex, data) => {
                if (data && data === "{\"status\":500}")
                    return new Error("mapping ok");
                return ex;
            })
            .fetch();
    }
    catch (ex) {
        if (ex.message === "mapping ok")
            console.info("error map test ok");
        else
            console.error("error map test failed");
    }

    // basic auth test
    try {
        const
            json = await new Fetch("https://postman-echo.com/basic-auth").basicAuth("postman", "password").fetch(),
            obj = JSON.parse(json);
        if (obj && obj.authenticated === true)
            console.info("basic auth ok");
        else
            console.error("basic auth failed");
    }
    catch (ex) {
        console.error(`exception: ${ex.message || ex}`);
    }

    // stream test
    try {
        const stream = Fs.createWriteStream("out.txt");
        await new Fetch("https://postman-echo.com/stream/5").pipe(stream);
        console.info("stream ok");
    }
    catch (ex) {
        console.error(`exception: ${ex.message || ex}`);
    }

    // timeout
    try {
        await new Fetch("https://postman-echo.com/delay/10").timeout(1000).fetch();
        console.error("timeout failed");
    }
    catch (ex) {
        if (ex.message?.includes("timeout"))
            console.info("timeout ok");
        else
            console.error("got timeout, but invalid ex");
    }

    // temp. redirect test (307)
})();
