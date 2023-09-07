require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('node:dns');
const url = require('node:url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const data = [];

const getURL = (uri) => {
  let u;
  if (uri == '') return null;
  try {
    u = new url.URL (uri);
  } catch (e) {
    console.error (e);
    return null;
  }
  return u;
};

const getShortURL = (uri) => {
  let original = uri.trim (), index = data.map (p => p.original_url).indexOf (original);

  if (index > -1) {
    return data[index];
  }

  // new URL
  var shorts = data.map (p => p.short_url);
  index = 0;
  while (shorts.indexOf (index) > -1) index++;

  let item = { original_url : original, short_url : index };
  data.push (item);
  return item;
};

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use ( bodyParser.urlencoded({extended: false}) );

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  var req_url = getURL (req.body.url);
  if (req_url) dns.lookup (req_url.host, (err, ip, t) => {
    if (err) {
      console.log ("ERROR:", "BAD URL", err);
      res.json ({ error: 'invalid url' });
    } else {
      res.json (getShortURL (req.body.url));
    }
    console.log (req.body.url, ip, t);
  });
  else res.json ({ error: 'invalid url' });
});

app.get('/api/shorturl/:word', function(req, res) {
  let index = parseInt (req.params.word);
  var shorts = data.map (p => p.short_url);
  index = shorts.indexOf (index);
  if (index > -1) res.redirect (data[index].original_url);
  else res.json ({ error: 'invalid url' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
