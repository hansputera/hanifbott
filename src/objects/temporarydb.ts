import { PathLike, readdirSync, writeFileSync } from "fs";

export default class TemporaryDatabase {
    constructor(public saveDirPath: PathLike) {}
    public db: Map<string, any> = new Map();

    public get(key: string) {
        return this.db.get(key);
    }
    public delete(key: string) {
        return this.db.delete(key);
    }
    public toArray() {
        return Array.from(this.db, ([k, v]) => ({ name: k, value: v }));
    }
    public set(key: string, value: any) {
        return this.db.set(key, value);
    }
    public removeAll() {
        this.db.clear();
        return this.db;
    }
    public save() {
        const now = Date.now();
        const data = this.toArray();
        writeFileSync(`${this.saveDirPath}/data-${now}.json`, JSON.stringify(data));
        return {
            dir: `${this.saveDirPath}/data-${now}.json`,
            data
        }
    }
    public saves() {
        return readdirSync(this.saveDirPath);
    }
}