const rp = require('request-promise');
const $ = require('cheerio')
const url = 'https://www.hasznaltauto.hu/szemelyauto/mercedes-benz/e_230/mercedes-benz_e_230_automata-14188928';

rp(url)
  .then(function(html) {
    console.log($('<td class="bal pontos">Vételár:</td>', html).next('td'));
  })
  .catch(function(err) {
    //handle error
    console.log(err)
  });