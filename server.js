var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '/public')));

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.post('/favorites', function(req, res){
  if(!req.body.name || !req.body.oid){
    res.send("Error");
    return
  }
  
  var data = JSON.parse(fs.readFileSync('./data.json'));

  // Little check for duplicates
  // Normally wouldn't put any business logic in route
  var isDuplicate = false;
  for (var i = 0; i < data.length; i++) {
    obj = data[i];
    if (obj.oid === req.body.oid) {
      isDuplicate = true;
    }
  }

  if (isDuplicate) {
    res.send('Already Favorited that one!');
    return
  } else {
    data.push(req.body);
    fs.writeFile('./data.json', JSON.stringify(data));
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  }
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});