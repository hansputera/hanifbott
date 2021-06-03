import fetch, { RequestInit } from "node-fetch";
import HTTPProxyAgent from "http-proxy-agent";
import config from "../config";

export default function request(baseURL: string, endpoint?: string, useProxy?: boolean, options?: RequestInit) {
    if (useProxy) options.agent = HTTPProxyAgent(`http://${config.proxy.user}:${config.proxy.password}@${config.proxy.host}:${config.proxy.port}`);
    return fetch(`${baseURL}${endpoint ? endpoint : ""}`, options);
}