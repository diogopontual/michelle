const urllib = require("urllib");
const fs = require('fs');
const cheerio = require("cheerio");
const alphabet = "0abcdefghijklmnopqrstuvwxyz";
// const alphabet = "v";
const baseUrl = "https://www.business-humanrights.org/";
for (let i = 0; i < alphabet.length; i++) {
  setTimeout(function() {
    let url = `${baseUrl}/en/find-companies?letter=${alphabet.charAt(i)}`;
    console.log(url);
    urllib.request(url, (err, data, res) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        $ = cheerio.load(data);
        $("tr.company_list_row td a.company_name").each((idx, el) => {
          let name = $(el).text();
          let url = $(el).attr("href");
          setTimeout(function() {
            loadCompany(name, url);
          }, 1000 * idx);
        });
      } catch (err) {
        console.log(err);
      }
    });
  }, 120000 * i);
}

function loadCompany(name, url) {
  console.log(`loading ${name}: ${url}`);
  if (url.indexOf("/ru/") >= 0) return;
  let page = 0;
  let fullURL = `${baseUrl}${url}?/?dateorder=datedesc&page=${page}&componenttype=all`;
  try {
    urllib.request(fullURL, (err, data, res) => {

      if (err) {
        console.log(`error ${name}: ${err}`);
        return;
      }
      // if(name == 'Vale'){
      //   console.log(data.toString('utf8'));
      // }
      if (!data) return;
      try {
        $ = cheerio.load(data);
        let country = $('h3.company_subtitle a').text();
        if(country == 'Brazil'){
          fs.appendFileSync('brazil.txt',name + "\n",'utf-8');
        }
        let ps = $('.primary p');
        console.log(ps.first().text());
        
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(`error`);
    console.log(fullURL);
    console.log(err);
  }
}
