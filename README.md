# Save your data locally with easy database system!

Database System written with TypeScript

`All data is encrypted in model files`

## Events are Available!!

[See Events](#events)

## New Filter IN Methods

$in, $nin

[See Filter IN Methods](#filter-and-update)

## $ Installation

```shell
npm install @onlydann/database
```

Or

```shell
yarn add @onlydann/database
```

# Setup

```javascript
import { createDatabase } from "@onlydann/database";

// setuping folder
const db = await createDatabase("../databaseFolder");

// it is more secure, use your custom passphrase
const dbWithCustomPassphrase = await createDatabase({
  enc_pass: "My Passphrase",
  path: "../databaseFolder",
});
```

# Creating schema and model

```javascript
// JavaScript
import { Schema, Value, Model } from "@onlydann/database";

const userSchema = new Schema({
    username: new Value("string", {unique: true}),
    password: new Value("string"),
    age: new Value("number", {default: 18}),
    tags: new Value("array", {default: []}),
    endsIn: new Value("date"), {default: () => new Date()}
});

const UserModel = new Model("users", userSchema);

export default UserModel;
```

```typescript
// TypeScript
import { Schema, Value, Model } from "@onlydann/database";

interface User {
  _id: string;
  _createdAt: Date;
  username: string;
  password: string;
  age?: number;
  tags?: string[];
  endsIn?: Date
}

const userSchema = new Schema<User>({
    username: new Value("string", {unique: true}),
    password: new Value("string"),
    age: new Value("number", {default: 18}),
    tags: new Value("array", {default: []}),
    endsIn: new Value("date"), {default: () => new Date()}
});


const UserModel = new Model("users", userSchema);

export default UserModel;
```

# Default (Reserved) properties

**There are some default properties extended from document**

You can specify them in interface with other props, Schema will **Omit** them

```typescript
// Unique string of symbols for database
_id: string;
// Document creation date
_createdAt: Date;
```

# Filter and Update

**Filter**

First argument is filter object, so we can do..

```javascript
// all props are the same as filter object
await users.get({ username: "Dann" });
// if any prop exists in document
await users.all({ $or: { username: "Dann", age: 20 } });
// callback filter function, first arg is document, must return boolean
await users.delete((doc) => doc.tags.length > 10);
// if any doc's username in array
await users.get({ username: { $in: ["Dann", "Meri"] } });
// if any doc's username NOT in array
await users.get({ username: { $nin: ["Dann", "Meri"] } });
```

**Update**

Model.update methods are using Update object as second argument

```javascript
await users.update(filter, { $set: { username: "Aren" } });
// also you can use -number
await users.update(filter, { $inc: { age: 1 } });
// push works only if property is an array
await users.update(filter, { $push: { tags: "developer" } });
```

# Model

Register a models

```javascript
await db.registerModels(UserModel);
// await db.registerModels(UserModel, MessageModel, AnyModel, ...);
```

Methods

<details>
<summary>create</summary>
Create a document

it takes one argument

```javascript
// others props are optional and have default values
const userDocument = await users.create({
  username: "Dann",
  password: "1234",
});
```

</details>

<details>
<summary>createAll</summary>
Create documents

it takes one argument - array

```javascript
const userDocument = await users.createAll([
  {
    username: "Dann",
    password: "1234",
  },
  { username: "Meri", password: "cuteOne" },
]);
```

</details>

<details>
<summary>all</summary>

Get all documents

```javascript
// all
const userDocuments = await users.all();
```

See [Filter](#filter-and-update)

```javascript
// also you can use Filter as first argument
const userDocuments = await users.all(filter);
```

</details>

<details>
<summary>get</summary>

Get one document

See [Filter](#filter-and-update)

```javascript
// filter
const userDocument = await users.get(filter);
```

</details>

<details>
<summary>getById</summary>

Get one document with its [\_id](#default-reserved-properties)

```javascript
const userDocument = await users.getById("0BQae1vE%A%Ie@X1r%5su3O5YS7^45");
```

</details>

<details>
<summary>delete</summary>

Delete one document

See [Filter](#filter-and-update)

```javascript
await users.delete(filter);
```

</details>

<details>
<summary>deleteById</summary>

Delete one document with its [\_id](#default-reserved-properties)

```javascript
await users.deleteById("0BQae1vE%A%Ie@X1r%5su3O5YS7^45");
```

</details>

<details>
<summary>deleteAll</summary>

Delete all documents

```javascript
await users.deleteAll();
```

See [Filter](#filter-and-update)

```javascript
// filter
await users.deleteAll(filter);
```

</details>

<details>
<summary>update</summary>

Update one document

See [Filter and Update](#filter-and-update)

```javascript
const updatedUser = await users.update(filter, update);
```

</details>

<details>
<summary>updateAll</summary>

Update all documents

See [Filter and Update](#filter-and-update)

```javascript
const updatedUsersArray = await users.updateAll(filter, update);
```

</details>

# Document

**Document** class implements [Reserved Properties](#default-reserved-properties)

Methods

<details>
<summary>delete</summary>

Delete current document

```javascript
await userDocument.delete();
```

</details>

<details>
<summary>clone</summary>

Clone current document

```javascript
await userDocument.clone();
```

</details>

<details>
<summary>toJson</summary>

we are useing this method for saving document in base

So it's not usable

```javascript
const userJson = userDocument.toJson();
```

</details>

# Events

Each Model now has Event System

There are 3 types of events

`create, delete, update`

```javascript
// create
users.on("create", (doc) => {
  // created document
  console.log(doc._id);
});

users.on("delete", (doc) => {
  // deleted document
  console.log(doc._id);
});

users.on("update", (oldDoc, newDoc) => {
  // newDoc is the updated version of oldDoc
  console.log(oldDoc, newDoc);
});
```

# Feature Updates

- Nested object filtering and updating
