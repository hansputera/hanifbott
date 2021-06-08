import axios, { AxiosRequestConfig } from "axios";

export default function request(baseURL: string, options?: AxiosRequestConfig) {
    return axios.create({
        baseURL,
        ...options
    });
}