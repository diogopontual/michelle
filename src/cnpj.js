const fs = require('fs');
const unzipper = require('unzipper');
const homedir = require('os').homedir();

const folder=process.argv[2];

begin();

async function begin(){
  fs.readdir(folder, async function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    for (const file of files) {
      await unzipFile(folder + file, file)  
    }
});
}
async function unzipFile(file, filename){
  await fs.createReadStream(file).pipe(unzipper.Extract({ path: homedir + '/ziptmp/' + filename }));  
}

function delay(t, val) {
  return new Promise(function(resolve) {
      setTimeout(function() {
          resolve(val);
      }, t);
  });
}