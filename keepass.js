const io = require("./io");
require("dotenv").config();

const { DB_PATH, KEY_PATH, PW } = process.env;
const param = process.argv.slice(2)[0];

async function main() {
  const db = new io.Database(DB_PATH, PW, KEY_PATH);
  await db.load();
  const result = db.search(new RegExp(param));
  console.log(result);
}

main();
