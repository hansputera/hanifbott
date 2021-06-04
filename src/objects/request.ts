import fetch, { RequestInit } from "node-fetch";

export default function request(baseURL: string, endpoint?: string, options?: RequestInit) {
    return fetch(`${baseURL}${endpoint ? endpoint : ""}`, options);
}