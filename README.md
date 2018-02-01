# planck-http-fetch

Simple promise based HTTP/HTTPS fetch.

## Install

`npm install planck-http-fetch`

## Use

```typescript
import { Fetch } from "planck-http-fetch";

let
    data = await new Fetch("https://...", 1000) // url + timeout (if not set - 10s)
        .head("Api-Key", "123") // sets header
        .head("Host", "my.host.com")    // sets another header
        .unauthorized() // skips certificate check if https
        .fetch("data to send", "text/plain");   // do request with data and content type
```

For `fetch` method:

> If `data` is set `POST` is used, else `GET`

> If `contentType` is not set, `application/json;charset=utf-8` is used