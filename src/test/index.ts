import { createDatabase, Schema, Value } from "..";

createDatabase("./db").then(async (db) => {
  const model = await db.createModel(
    "users",
    new Schema<{ hello?: string; das?: number; date?: Date }>({
      hello: new Value("string", { default: () => "hello" }),
      das: new Value("number", { default: Math.random() }),
      date: new Value("date", { default: new Date() }),
    })
  );

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
