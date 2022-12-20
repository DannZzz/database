import { createDatabase, Schema, Value } from "..";

createDatabase("./db").then(async (db) => {
  const model = await db.createModel(
    "users",
    new Schema<{ hello?: string; das?: number }>({
      hello: new Value("string", { default: "hello", unique: true }),
      das: new Value("number", { default: Math.random() }),
    })
  );

  // await model.create({ hello: "asd" });
  // await model.create({ hello: "das" });
  // await model.create({ hello: "lolitdsaa" });
  // await model.create({ das: 10 });

  console.log(await model.all({}));
  // console.log(await model.get({ hello: "asd" }));

  // await model.getById("");
});
