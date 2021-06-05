"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
function request(baseURL, endpoint, options) {
    return node_fetch_1.default(`${baseURL}${endpoint ? endpoint : ""}`, options);
}
exports.default = request;
