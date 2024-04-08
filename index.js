require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns =require("dns");
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const urlDatabase = {};

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const domainExists = async (url) => {
  const domain = new URL(url).hostname;
  return new Promise((resolve) => {
    dns.lookup(domain, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const isValidDomain = await domainExists(url);
  if (!isValidDomain) {
    return res.json({ error: 'invalid url' });
  }

  const shortCode = shortid.generate();
  urlDatabase[shortCode] = url;
  res.json({ 
    original_url:url,
    short_url:shortCode
   });
});

  
app.get('/api/shorturl/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;
  const originalUrl = urlDatabase[shortCode];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
