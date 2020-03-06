const wget = require("node-wget");
const cheerio = require("cheerio");
const alphabet = "0abcdefghijklmnopqrstuvwxyz";
const baseUrl = "https://www.business-humanrights.org/en";
for (let i = 0; i < alphabet.length; i++) {
  wget(
    `${baseUrl}/find-companies?letter=${alphabet.charAt(i)}`,
    (err, response, body) => {
      $ = cheerio.load(body);
      $("tr.company_list_row td a.company_name").each((idx, el) => {
        let name = $(el).text();
        let url = $(el).attr("href");
        loadCompany(name, url);
      });
    }
  );
}

function loadCompany(name, url) {
  if(url.indexOf('/ru/') >= 0)
    return;
  let page = 0;
  let fullURL = `${baseUrl}${url}?/?dateorder=datedesc&page=${page}&componenttype=all`;
  try {
    wget(fullURL, (err, response, body) => {
        console.log(err);
        console.log(`${name}: ${url}`);
    });
  }catch(err){
      console.log(`error`);
      console.log(fullURL);
      console.log(err);
  }
}
