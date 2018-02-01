import * as Http from "http";
import * as Https from "https";
import * as Url from "url";

export class Fetch {
    private readonly _options: Https.RequestOptions;

    constructor(url: string, timeoutMS = 10000) {
        let
            temp = Url.parse(url);

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

    fetch(content?: string, contentType = "application/json;charset=utf-8") {
        if (content != null) {
            this._options.method = "POST";
            this._options.headers["Content-Type"] = contentType;
            this._options.headers["Content-Length"] = Buffer.byteLength(content, "utf8");
        }

        let
            requestFn = this._options.protocol === "http:" ? Http.request : Https.request;

        return new Promise<string>((resolve, reject) => {
            let
                request = requestFn(this._options, (response) => {
                    if (response.statusCode < 200 || response.statusCode > 299)
                        reject(new Error(`Http fetch failed, status = ${response.statusCode}, ${response.statusMessage}`));
                    else {
                        response.setEncoding("utf8");

                        let
                            data = "";
                        response.on("data", (chunk) => {
                            data += chunk;
                        });
                        response.on("end", () => {
                            resolve(data);
                        });
                    }
                });

            request.on("error", (ex) => {
                reject(ex)
            });

            if (content != null)
                request.write(content);

            request.end();
        });
    }
}