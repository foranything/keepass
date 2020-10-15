var kpio = require("keepass.io");

const databasePath = "./database.kdbx";
const newDatabasePath = "./newDatabase.kdbx";

var db = new kpio.Database();
db.addCredential(new kpio.Credentials.Password("thematrix"));
db.addCredential(new kpio.Credentials.Keyfile("apoc.key"));
db.loadFile(databasePath, function (err) {
  if (err) throw err;

  var rawDatabase = db.getRawApi().get();
  console.log("Database name: " + rawDatabase.KeePassFile.Meta.DatabaseName);
  rawDatabase.KeePassFile.Meta.DatabaseName = "KeePass.IO rocks!";

  db.resetCredentials();
  db.addCredential(new kpio.Credentials.Password("morpheus"));
  db.addCredential(new kpio.Credentials.Keyfile("trinity.key"));

  db.getRawApi().set(rawDatabase);
  db.saveFile(newDatabasePath, function (err) {
    if (err) throw err;
  });
});
