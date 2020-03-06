var urllib = require("urllib");
const cheerio = require("cheerio");
const alphabet = "0abcdefghijklmnopqrstuvwxyz";
const baseUrl = "https://www.business-humanrights.org/en";
for (let i = 0; i < alphabet.length; i++) {
  urllib.request(
    `${baseUrl}/find-companies?letter=${alphabet.charAt(i)}`,
    (err, data, res) => {
      $ = cheerio.load(data);
      $("tr.company_list_row td a.company_name").each((idx, el) => {
        let name = $(el).text();
        let url = $(el).attr("href");
        loadCompany(name, url);
      });
    }
  );
}

function loadCompany(name, url) {
  if (url.indexOf("/ru/") >= 0) return;
  let page = 0;
  let fullURL = `${baseUrl}${url}?/?dateorder=datedesc&page=${page}&componenttype=all`;
  try {
    urllib.request(fullURL, (err, data, res) => {});
  } catch (err) {
    console.log(`error`);
    console.log(fullURL);
    console.log(err);
  }
}
