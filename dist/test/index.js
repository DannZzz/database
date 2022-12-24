"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
(0, __1.createDatabase)("./db").then(async (db) => {
    const model = await db.createModel("users", new __1.Schema({
        hello: new __1.Value("string", { default: () => "hello" }),
        das: new __1.Value("number", { default: Math.random() }),
        date: new __1.Value("date", { default: new Date() }),
    }));
    // await model.deleteAll();
    // setTimeout(() => {
    // (await model.create({}).);
    // await model.create({ hello: "asgfdd" });
    // console.log(await model.all());
    // }, 5000);
    // await model.create({ hello: "das" });
    // await model.create({ hello: "lolitdsaa" });
    // await model.create({ das: 10 });
    // await model.updateAll({}, { $inc: { das: 100 } });
    // await model.deleteAll();
    console.log(await model.all());
    // await model.getById("");
});
