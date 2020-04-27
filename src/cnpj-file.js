const lineReader = require("line-reader");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://elastic:senhadoelastic@bart.diogopontual.com.br:9200" });
let bulk = [];
count = 0;
lineReader.eachLine(process.argv[2], function(line, last) {
  if (line.charAt(0) == "1") {
    count++;
    //empresa
    let obj = {
      tipo: line.charAt(17), //1 = matriz, 2 = filial
      nomeEmpresarial: line.substr(18, 150).trim(),
      nomeFantasia: line.substr(168, 55).trim(),
      situacao: line.substr(223, 2),
      cnae: line.substr(375, 7),
      porte: line.substr(905, 2),
      capital: Number.parseInt(line.substr(891, 14)),
      cnpj: line.substr(3, 14)
    };

    bulk.push({ index: { _index: "cnpj" } }, obj);
    
  }
  if (bulk.length > 1000 || last) {
    console.log('mandando para o elastic');
    client.bulk(
      {
        index: "cnpj",
        body: bulk
      },
      function(err, resp) {
        if (err) {
          console.log(err);
          callback(err);
        } else {
         console.log("items", resp.body.items.length);
        }
      }
    );
    bulk = [];
  }
  if (last) {
    console.log("total", count);
  }
});
