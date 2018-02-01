import { Fetch } from "./Fetch";

let
    fetch = new Fetch("https://postman-echo.com/post");

fetch
    .fetch("hello", "text/plain").then(json => {
        let
            obj = JSON.parse(json);
        if (!obj || obj.data !== "hello")
            console.error(`invalid response`);
        else
            console.info("all ok")
    })
    .catch(ex => {
        console.error(`fetch failed: ${ex.message || ex}`);
    });

