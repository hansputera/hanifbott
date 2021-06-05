"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class TemporaryDatabase {
    constructor(saveDirPath) {
        this.saveDirPath = saveDirPath;
        this.db = new Map();
    }
    get(key) {
        return this.db.get(key);
    }
    delete(key) {
        return this.db.delete(key);
    }
    toArray() {
        return Array.from(this.db, ([k, v]) => ({ name: k, value: v }));
    }
    set(key, value) {
        return this.db.set(key, value);
    }
    removeAll() {
        this.db.clear();
        return this.db;
    }
    save() {
        const now = Date.now();
        const data = this.toArray();
        fs_1.writeFileSync(`${this.saveDirPath}/data-${now}.json`, JSON.stringify(data));
        return {
            dir: `${this.saveDirPath}/data-${now}.json`,
            data
        };
    }
    saves() {
        return fs_1.readdirSync(this.saveDirPath);
    }
}
exports.default = TemporaryDatabase;
