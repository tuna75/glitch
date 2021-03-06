const puppeteer = require('puppeteer-core');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SECRET;

(async () => {
  const browser = await puppeteer.launch({
    "executablePath": ".tmp/dir/opt/google/chrome/chrome",
    "args": ["--no-sandbox"]
  });
  const options = {
    "timeout": 0
  };
  const agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36'
  let r1 = await browser.newPage();
  r1.setUserAgent(agent);
  r1.goto('https://radioearn.com/radio/start.php?uid=21346', options);

  let r2 = await browser.newPage();
  r2.setUserAgent(agent);
  r2.goto('https://radioearn.com/radio/2/start.php?uid=21346', options);

  let r3 = await browser.newPage();
  r3.setUserAgent(agent);
  r3.goto('https://radioearn.com/radio/3/start.php?uid=21346', options);

  let r4 = await browser.newPage();
  r4.setUserAgent(agent);
  r4.goto('https://radioearn.com/radio/4/start.php?uid=21346', options);
})();

async function stat(key) {
  let res = await fetch(`https://radioearn.com/api/get.php?uid=21346&api=${key}&out=2`);
  let text = await res.text();
  let sanitized = `[${text.replace(/}{/g, '},{')}]`;
  let arr = JSON.parse(sanitized);
  let data = arr.reduce((accumulator, value) => {
    accumulator[value.IP] = accumulator[value.IP] || {};
    accumulator[value.IP][value.Station] = (parseInt(value.Status)) ? 'Connected' : 'Disconnect';
    return accumulator;
  }, {});

  return data;
}

const { promisify } = require('util');
const fs = require('fs').promises;
const exec = promisify(require('child_process').exec);
const puppeteer = require('puppeteer-core');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.PRIVATE;
const uid = process.env.PUBLIC
const alive = [];

async function chrome() {
  try {
    await exec('find google-chrome-stable_current_amd64.deb');
  } catch(err) {
    await exec('wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb');
  } finally {    
    await exec('rm -rf /tmp/*');
    await exec('dpkg -x google-chrome-stable_current_amd64.deb /tmp/dir');
  }
}

async function listen() {
  const browser = await puppeteer.launch({
    "executablePath": "/tmp/dir/opt/google/chrome/chrome",
    "args": ["--no-sandbox"]
  });
  const options = { "timeout": 0 };
  const agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36';
  
  try {
    alive.push(browser);
    let r1 = await browser.newPage();
    r1.setUserAgent(agent);
    r1.goto(`https://radioearn.com/radio/start.php?uid=${uid}`, options);

    let r2 = await browser.newPage();
    r2.setUserAgent(agent);
    r2.goto(`https://radioearn.com/radio/2/start.php?uid=${uid}`, options);

    let r3 = await browser.newPage();
    r3.setUserAgent(agent);
    r3.goto(`https://radioearn.com/radio/3/start.php?uid=${uid}`, options);

    let r4 = await browser.newPage();
    r4.setUserAgent(agent);
    r4.goto(`https://radioearn.com/radio/4/start.php?uid=${uid}`, options);
  } catch(err) {
    alive.splice(alive.indexOf(browser), 1);
    browser.close();
  }
}

async function stat(key) {
  let res = await fetch(`https://radioearn.com/api/get.php?uid=${uid}&api=${secret}&out=2`);
  let text = await res.text();
  let sanitized = `[${text.replace(/}{/g, '},{')}]`;
  let arr = JSON.parse(sanitized);
  let data = arr.reduce((accumulator, value) => {
    accumulator[value.IP] = accumulator[value.IP] || {};
    accumulator[value.IP][value.Station] = (parseInt(value.Status)) ? 'Connected' : 'Disconnected';
    return accumulator;
  }, {});

  return data;
}

setInterval(async () => {
  if(alive.length === 0) {
    await chrome();
    await listen();
  }
}, 60000);

app.get('/', async (req, res) => {
  let data = await stat(secret);
  res.send(data);
});

app.post('/', async (req, res) => {
  console.log(alive);
  if(alive.length !== 0) {
    await alive.forEach(async (browser) => {
      await browser.close();
    });
  }
  await chrome();
  await listen();
  res.send('Restarted puppeteer.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
app.get('/', async (req, res) => {
  let data = await stat(secret);
  res.send(data);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
  setInterval(async () => {
    let res = await fetch('/');
    let data = await res.json();
    console.log(data);
  }, 60000);
});
