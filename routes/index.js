const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('../db/db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/../public'));

app.get('/', (req, res) => {
  res.sendFile('main.html', {root: __dirname + '/../public'});
});

app.get('/test', (req, res) => {
  res.send({success: true});
});

app.post('/test', (req, res) => {
  console.log(req.body.test);
  res.send(req.body);
});

app.post('/run', (req, res) => {
  db.recordCreate(req.body, (err, result) => {
    if (err) console.log(err);
    else if (result) return res.send({success: true});

    res.send({success: false});
  });
});

app.get('/run', (req, res) => {
  if (req.query.start && req.query.end) {
    db.getRecordByTime(Number(req.query.start), Number(req.query.end), (err, result) => {
      if (err) console.log(err);
      else if (result) return res.send({success: true, result});
      res.send({success: false});
    });
  } else if (req.query.description) {
    db.getRecordByDescription(req.query.description, (err, result) => {
      if (err) console.log(err);
      else if (result) return res.send({success: true, result});
      res.send({success: false});
    });
  } else {
    res.send({success: false});
  }
});

app.get('/runs',(req ,res)=>{
  let {start, end, envSize, regionNum, steps, description}= req.query;
  db.getAllRecords(function(err,records){
    if (err) {
      res.send(err)
    } else {
      let result = records.filter((run)=>{
        if (
          (envSize==null||(run.environment.length == envSize.split(',')[1]&&run.environment[0].length==envSize.split(',')[0]))
          &&
          ((start == null && end==null)||(start<run.id && end > run.id))
          &&
          (description==null||(run.description.indexOf(description)>-1))
          &&
          (regionNum==null||(run.regions.length == regionNum))
          &&
          (steps == null||(run.steps == steps))
      ) {
          return true;
        }
        return false;
      })
      res.send(result);
    }
  })
})

app.listen(3000, () => {
  console.log('Server is running at port 3000');
});
