import { existsSync, PathLike, readFileSync, unlinkSync, writeFileSync } from "fs";

export default class TemporaryDatabase {
    constructor(public saveDirPath: PathLike) {}
    public db: Map<string, any> = new Map();

    public reuse() {
        if (!existsSync(`${this.saveDirPath}/db.json`)) return false;
        const data = JSON.parse(readFileSync(`${this.saveDirPath}/db.json`, { encoding: "utf8" }));
        if (data != []) data.forEach((doc: { name: any; value: any; }) => {
            this.set(doc.name, doc.value);
        });
        return true;
    }
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
        if (existsSync(`${this.saveDirPath}/db.json`)) unlinkSync(`${this.saveDirPath}/db.json`);
        const now = Date.now();
        const data = this.toArray();
        if (data.length) writeFileSync(`${this.saveDirPath}/db.json`, JSON.stringify(data));
        return {
            dir: `${this.saveDirPath}/data-${now}.json`,
            data
        }
    }
}