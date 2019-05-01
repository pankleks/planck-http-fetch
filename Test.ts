import { Fetch } from "./Fetch";

(async () => {
    const
        TEST = "hello",
        t = new Date().getTime(),
        fetch = new Fetch("https://postman-echo.com/post").head("X-Time", t);

    try {
        const json = await fetch.fetch(TEST, "text/plain");
        const obj = JSON.parse(json);
        if (!obj)
            console.log("empty response");
        else {
            if (obj.data !== TEST)
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
        await new Fetch("http://google.com").fetch();
    }
    catch (ex) {
        if (ex.statusCode !== 301)
            console.error("error test failed");
        else    
            console.info("error test ok");
    }

    // basic auth test
    try {
        const json = await new Fetch("https://postman-echo.com/basic-auth").basicAuth("postman", "password").fetch();
        const obj = JSON.parse(json);
        if (obj && obj.authenticated === true)
            console.info("basic auth ok");
        else
            console.error("basic auth failed");
    }
    catch (ex) {
        console.error(`exception: ${ex.message || ex}`);
    }
})();
