const fetch = require("node-fetch");
const fs = require("fs");
let arr = [];
//https://www.investmentmap.org/api/affiliates/by-affiliate?economicActivityCode=TT&hostCountryCode=076&investingCountryCode=000&offset=0&limit=12000&locale=en 
fetch('https://www.investmentmap.org/api/affiliates/by-affiliate?economicActivityCode=TT&hostCountryCode=000&investingCountryCode=076&offset=0&limit=10000&locale=en')
  .then(response => response.json())
  .then(json => {
    let rows = json.data.rows
    rows.forEach(row => {
        // console.log(row);
        let obj = {}
        for (const key in row.data) {
            if (row.data.hasOwnProperty(key)) {
                const element = row.data[key];
                 obj[key] = element.value
            }

        }    
        arr.push(obj)
    });
    console.log(arr.length)
    fs.appendFileSync('investmentmap_investing_brazil.json',JSON.stringify(arr));
  })
  .catch(err => {
    //   console.log(err)
  })