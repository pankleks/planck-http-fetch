import * as Http from "http";
import * as Https from "https";
import * as Url from "url";

export class FetchEx extends Error {
    constructor(message: string, public readonly statusCode?: number, data?: string) {
        super(message);
    }
}

export class Fetch {
    protected readonly _options: Https.RequestOptions;

    /**
     * creates new instance of `Fetch` bound to given url
     * @param url url     
     */
    constructor(url: string, options?: Https.RequestOptions) {
        const temp = Url.parse(url);

        if (!options)
            options = {
                method: "GET",
                timeout: 20000,
                rejectUnauthorized: true,
                headers: {}
            }

        this._options = Object.assign(options, {
            hostname: temp.hostname,
            port: Number(temp.port),
            path: temp.path,
            protocol: temp.protocol
        });
    }

    /**
     * sets request timeout (by default timeout is auto-set for 20 seconds)
     * @param ms timeout in miliseconds
     */
    timeout(ms: number) {
        this._options.timeout = ms;
        return this;
    }

    /**
     * setup https options
     * @param key 
     * @param cert 
     */
    cert(key: string, cert: string) {
        this._options.key = key;
        this._options.cert = cert;
        return this;
    }

    /**
     * sets request header
     * @param key key
     * @param value value
     */
    head(key: string, value: any) {
        this._options.headers[key] = value;
        return this;
    }

    /**
     * use to ignore https certificate issues
     */
    unauthorized() {
        this._options.rejectUnauthorized = false;
        return this;
    }

    /**
     * sets basic authorization header to given user/password
     * @param user user
     * @param password password
     */
    basicAuth(user: string, password: string) {
        this._options.headers["Authorization"] = "Basic " + Buffer.from(user + ":" + password).toString("base64");
        return this;
    }

    /**
     * set bearer authorization header to given token
     * @param token token
     */
    bearerAuth(token: string) {
        this._options.headers["Authorization"] = `Bearer ${token}`;
        return this;
    }

    private initRequest(resolve: (response: Http.IncomingMessage) => void, reject: (ex: FetchEx) => void) {
        const request = (this._options.protocol === "http:" ? Http.request : Https.request)(
            this._options,
            (response) => {
                response.on("error", (ex) => {
                    reject(this._exMap(new FetchEx(`http resp. error -> ${ex.message || ex}`, response.statusCode)));
                });

                resolve(response);
            }
        );

        request.on("error", (ex) => {
            reject(this._exMap(new FetchEx(`http req. error -> ${ex.message || ex}, aborted = ${request.aborted}`)));
        });

        request.on("timeout", () => {
            request.destroy(new Error("timeout"));
        })

        return request;
    }

    /**
     * sends request with optional content
     * @param content content
     * @param contentType content type, by default `application/json`
     * @param method http method, by default `GET` (or `POST` if content is set)
     * @param encoding by default `utf8`
     * @async
     */
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
                        if (response.statusCode === 307) {
                            const location = response.headers.location;
                            if (!location)
                                reject(this._exMap(new FetchEx(`got redirect code = ${response.statusCode}, but without location`, response.statusCode, data)));
                            else
                                resolve(new Fetch(location, this._options).fetch(content, contentType, method, encoding));
                        }
                        else {
                            if (response.statusCode < 200 || response.statusCode > 299)
                                reject(this._exMap(new FetchEx(`http resp. invalid code = ${response.statusCode}, ${response.statusMessage}`, response.statusCode), data));
                            else
                                resolve(data);
                        }
                    });
                },
                reject);

            if (content != null)
                request.write(content, encoding);

            request.end();
        });
    }

    /**
     * pipes response stream to given target stream
     * @param stream target stream
     * @param end if `true` closes stream after finishing
     */
    pipe(stream: NodeJS.WritableStream, end?: boolean) {
        return new Promise<string>((resolve, reject) => {
            const request = this.initRequest(
                (response) => {
                    if (response.statusCode < 200 || response.statusCode > 299)
                        reject(this._exMap(new FetchEx(`http resp. invalid code = ${response.statusCode}, ${response.statusMessage}`, response.statusCode)));
                    else {
                        response.pipe(stream, { end });
                        stream.on("finish", () => {
                            resolve();
                        });
                    }
                },
                reject);

            request.end();
        });
    }


    private _exMap = (ex: Error, data?: string) => ex;

    /**
     * use to set your custom error message mapping
     * @param fn map function
     */
    exMap(fn: (ex: Error, data?: string) => Error) {
        this._exMap = fn;
        return this;
    }
}
