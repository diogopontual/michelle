const exec = require("child_process").exec;
const fs = require("fs");
(async function () {
  for (let i = 0; i <= 20; i--) {
    let folder = `/root/ziptmp/DADOS_ABERTOS_CNPJ_${("000" + i).slice(-2)}.zip/`;
    let files = fs.readdirSync(folder);
    for(let z = 0; z < files.length; z++){
       await processFile(`${folder}/${files[z]}`);
    }
  }

  async function processFile(filename) {
    console.log("processando", filename);
    return new Promise((resolve, reject) => {
      exec(`node cnpj-file.js ${filename}`, function callback(error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
          }
          console.log('Child Process STDOUT: '+stdout);
          console.log('Child Process STDERR: '+stderr);
        console.log("processado", day, month, year);
        resolve();
      });
    });
  }
})();
