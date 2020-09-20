const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://elastic:senhadoelastic@bart.diogopontual.com.br:9200" });
let arr = [];
count = 0;
let index = 'investmentmap-investing';


let bulk = async (d)=> {
  return new Promise((resolve, reject) => {
    console.log('doing bulk');
    client.bulk(
      {
        index: index,
        body: d
      },
      function (err, resp) {
        console.log(resp);
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("items", resp.body.items.length);
          resolve();
        }
      }
    );
  })
}

  (async function (){
    let txt = fs.readFileSync('../data/investmentmap_investing_brazil.json', 'utf-8');
    let json = JSON.parse(txt);
    console.log(json.length);
    for(let i = 0; i < json.length; i++){
      let el = json[i];
    
      arr.push({ index: { _index: index } },el);
      if (arr.length > 1000) {
        console.log(await bulk(arr))
        arr = [];
      }
    }
    await bulk(arr)
  })();

