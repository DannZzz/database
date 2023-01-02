import { createDatabase, Schema, Value, Model, Database } from "..";

createDatabase("./db").then(async (db) => {
  const model = new Model(
    "users",
    new Schema<{ hello?: string; das?: number; date?: Date }>({
      hello: new Value("string", { default: () => "hello" }),
      das: new Value("number", { default: Math.random() }),
      date: new Value("date", { default: new Date() }),
    })
  );

  await db.registerModels(model);

  model.on("create", (doc) => {
    console.log("event", doc);
  });

  model.on("update", (oldDoc, newDoc) => {
    console.log("oldDoc", oldDoc);
    console.log("newDoc", newDoc);
  });

  model.on("delete", (doc) => {
    console.log("delete", doc);
  });

  // setTimeout(() => {
  // (await model.create({}).);
  // await model.create({ hello: "asgfddda" });
  // await model.deleteAll();
  // console.log(await model.all());
  // }, 5000);
  // await model.create({ hello: "das" });
  // await model.create({ hello: "lolitdsaa" });
  // await model.create({ das: 10 });

  // await model.deleteAll();
  console.log(await model.all());
  // await model.getById("");
});
