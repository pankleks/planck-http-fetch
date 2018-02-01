import { Fetch } from "./Fetch";

const 
    TEST = "hello";

let
    t = new Date().getTime(),
    fetch = new Fetch("https://postman-echo.com/post").head("X-Time", t);

fetch
    .fetch(TEST, "text/plain").then(json => {
        let
            obj = JSON.parse(json);
        if (!obj)
            console.log(`empty response`);
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
    })
    .catch(ex => {
        console.error(`exception: ${ex.message || ex}`);
    });

