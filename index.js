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

app.post('/api/shorturl', (req, res) => {
  const body = req.body; 
  const hostname = req.hostname;
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      res.json({
        error:'invalid url'
      })
      return;
    }
  
  });

  const originalUrl = body.url;
  const shortCode = shortid.generate();
  urlDatabase[shortCode] = originalUrl;
  res.json({ 
    original_url:originalUrl,
    short_url:shortCode
   });

});

app.get('/app/shorturl/:shortCode', (req, res) => {
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
