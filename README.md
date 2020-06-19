# planck-http-fetch

Simple promise-based HTTP/HTTPS fetch.

## Install

`npm install planck-http-fetch`

## Use

```typescript
import { Fetch } from "planck-http-fetch";

const data = await new Fetch("https://...") // url
    .timeout(5000)  // timeout 5s
    .head("Api-Key", "123") // sets header
    .head("Host", "my.host.com")    // sets another header
    .basicAuth("user", "password")  // enables basic auth in HTTP header
    .unauthorized() // skips certificate check if https
    .fetch("data to send", "text/plain");   // do request with data and content type
```

For `fetch` method:

> If `data` is set `POST` is used, else `GET`

> If `contentType` is not set, `application/json;charset=utf-8` is used

### 307 temp. redirect

From version 1.7.2, temp. redirections (307) are handled automatically

## More info?

All methods have `JSDoc` comments, they provides more info on usage.
