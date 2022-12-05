const io = require("keepass.io");

const databasePath = "./database.kdbx";
const newDatabasePath = "./newDatabase.kdbx";

const db = new io.Database();
db.addCredential(new io.Credentials.Password("thematrix"));
db.addCredential(new io.Credentials.Keyfile("apoc.key"));
db.loadFile(databasePath, function (err) {
  if (err) throw err;

  const rawDatabase = db.getRawApi().get();
  console.log("Database name: " + rawDatabase.KeePassFile.Meta.DatabaseName);
  rawDatabase.KeePassFile.Meta.DatabaseName = "KeePass.IO rocks!";

  db.resetCredentials();
  db.addCredential(new io.Credentials.Password("morpheus"));
  db.addCredential(new io.Credentials.Keyfile("trinity.key"));

  db.getRawApi().set(rawDatabase);
  db.saveFile(newDatabasePath, function (err) {
    if (err) throw err;
  });
});
