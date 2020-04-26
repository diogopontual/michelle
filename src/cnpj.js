const fs = require("fs");
const unzipper = require("unzipper");
const homedir = require("os").homedir();

const folder = process.argv[2];

begin();

async function begin() {
  fs.readdir(folder, async function(err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    for (const file of files) {
      if (file.indexOf(".zip") > 0) await unzipFile(folder + file, file);
    }
  });
}
async function unzipFile(path, filename) {
  console.log("unzipping " + path);
  console.log(await fs.createReadStream(path).pipe(unzipper.Extract({ path: homedir + "/ziptmp/" + filename })));
}

function delay(t, val) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(val);
    }, t);
  });
}
