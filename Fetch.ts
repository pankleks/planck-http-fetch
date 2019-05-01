import * as Http from "http";
import * as Https from "https";
import * as Url from "url";

class FetchEx extends Error {
    constructor(message: string, public readonly statusCode?: number) {
        super(message);
    }
}

export class Fetch {
    private readonly _options: Https.RequestOptions;

    constructor(url: string, timeoutMS = 10000) {
        const temp = Url.parse(url);

        this._options = {
            hostname: temp.hostname,
            port: Number.parseInt(temp.port),
            path: temp.path,
            protocol: temp.protocol,
            method: "GET",
            timeout: timeoutMS,
            rejectUnauthorized: true,
            headers: {}
        };
    }

    head(key: string, value: any) {
        this._options.headers[key] = value;
        return this;
    }

    unauthorized() {
        this._options.rejectUnauthorized = false;
        return this;
    }

    basicAuth(user: string, password: string) {
        this._options.headers["Authorization"] = "Basic " + Buffer.from(user + ":" + password).toString("base64");
        return this;
    }

    bearerAuth(token: string) {
        this._options.headers["Authorization"] = `Bearer ${token}`;
        return this;
    }

    private initRequest(resolve: (response: Http.IncomingMessage) => void, reject: (ex: FetchEx) => void) {
        const request = (this._options.protocol === "http:" ? Http.request : Https.request)(
            this._options,
            (response) => {
                if (response.statusCode < 200 || response.statusCode > 299)
                    reject(new FetchEx(`http resp. invalid code = ${response.statusCode}, ${response.statusMessage}`, response.statusCode));
                else {
                    response.on("error", (ex) => {
                        reject(new FetchEx(`http resp. error, ${ex.message || ex}`, response.statusCode));
                    });

                    resolve(response);
                }
            });

        request.on("error", (ex) => {
            reject(new FetchEx(`http req. error, ${ex.message || ex}`));
        });

        return request;
    }

    fetch(content?: string | Buffer, contentType = "application/json;charset=utf-8", method?: string, encoding?: string) {
        if (content != null) {
            this._options.method = "POST";
            this._options.headers["Content-Type"] = contentType;
            this._options.headers["Content-Length"] = Buffer.byteLength(content, encoding || "utf8");
        }

        if (method != null)
            this._options.method = method;

        return new Promise<string>((resolve, reject) => {
            const request = this.initRequest(
                (response) => {
                    response.setEncoding(encoding || "utf8");

                    let data = "";
                    response.on("data", (chunk) => {
                        data += chunk;
                    });
                    response.on("end", () => {
                        resolve(data);
                    });
                },
                reject);

            if (content != null)
                request.write(content, encoding);

            request.end();
        });
    }

    pipe(stream: NodeJS.WritableStream, end?: boolean) {
        return new Promise<string>((resolve, reject) => {
            const request = this.initRequest(
                (response) => {
                    response.pipe(stream, { end });
                    stream.on("finish", () => {
                        resolve();
                    });
                },
                reject);

            request.end();
        });
    }
}
