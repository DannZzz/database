import { createDatabase, Schema, Value } from "..";

createDatabase("./db").then(async (db) => {
  const model = await db.createModel(
    "users",
    new Schema<{ hello?: string }>({
      hello: new Value("string", { default: "hello" }),
    })
  );

  console.log(await model.all());
  const created = await model.create({});
  console.log(await model.all());
  await created.delete();
  console.log(await model.all());

  // await model.getById("");
});
