const fetch = require('node-fetch');

fetch('https://radioearn.com/api/get.php?uid=21346&api=pVlpD1su6FOaYe3YFb&out=2').then((res) => {
  return res.text();
}).then((text) => {
  let sanitized = '[' + text.replace(/}{/g, '},{') + ']';
  let res = JSON.parse(sanitized);
  return res.reduce((accumulator, value) => {
    accumulator[value.IP] = accumulator[value.IP] || {};
    accumulator[value.IP][value.Station] = value.Status;
    return accumulator;
  }, {});

}).then((end) => {
  console.log(end);
})
