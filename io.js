let io = require("keepass.io");

class Database {
  /** @type {DB} */
  #db;

  #databasePath;

  #password;

  #keyfilePath;

  get #raw() {
    return this.#db.getRawApi().get();
  }

  get #root() {
    return this.#raw.KeePassFile.Root;
  }

  get entries() {
    return this.#root.Group.Entry;
  }

  get groups() {
    return this.#root.Group.Group;
  }

  get groupEntries() {
    return this.groups.reduce((acc, cur) => {
      const entries = cur.Entry;
      return acc.concat(entries);
    }, []);
  }

  /**
   * @param {string} databasePath
   * @param {string} password
   * @param {string?} keyfilePath
   */
  constructor(databasePath, password, keyfilePath) {
    this.#databasePath = databasePath;
    this.#password = password;
    this.#keyfilePath = keyfilePath;
  }

  /**
   * @return {Promise<DB>} db
   */
  async #load() {
    const db = new io.Database();
    db.addCredential(new io.Credentials.Password(this.#password));
    if (this.#keyfilePath)
      db.addCredential(new io.Credentials.Keyfile(this.#keyfilePath));
    let resolver;
    const promise = new Promise((res) => {
      resolver = res;
    });
    db.loadFile(this.#databasePath, (err) => {
      if (err) throw err;
      resolver(db);
    });
    return promise;
  }

  /**
   * @param {Entry} entry
   * @param {'Title' | 'URL' | 'UserName' | 'Password' | 'Notes' | 'KeePassHttp Settings'} key
   * @return {string | null}
   */
  #getEntryValue(entry, key) {
    if (entry == undefined) return null;
    const found = entry.String.find((it) => it.Key === key);
    return found ? found.Value : null;
  }

  /**
   * @param {Entry} entry
   * @return {string | null}
   */
  #getTitle(entry) {
    return this.#getEntryValue(entry, "Title");
  }

  /**
   * @param {Entry} entry
   * @return {string | null}
   */
  #getUrl(entry) {
    return this.#getEntryValue(entry, "URL");
  }

  #getId(entry) {
    return this.#getEntryValue(entry, "UserName");
  }

  /**
   * @param {Entry} entry
   * @return {string | null}
   */
  #getPassword(entry) {
    const found = this.#getEntryValue(entry, "Password");
    return found ? found._ : null;
  }

  async load() {
    this.#db = await this.#load();
  }

  /**
   * @param {RegExpConstructor} value
   */
  search(value) {
    const entries = [...this.entries, ...this.groupEntries];
    return entries
      .filter((entry) => {
        const title = this.#getTitle(entry);
        const url = this.#getUrl(entry);
        const id = this.#getId(entry);
        return value.test(title) || value.test(url) || value.test(id);
      })
      .map((entry) => ({
        title: this.#getTitle(entry),
        url: this.#getUrl(entry),
        id: this.#getId(entry),
        password: this.#getPassword(entry),
      }));
  }
}

module.exports.Database = Database;
