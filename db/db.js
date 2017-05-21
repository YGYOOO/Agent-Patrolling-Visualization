var mongodb = require('mongodb');
var url = 'mongodb://xuchaohui:Xu111111@ds046939.mlab.com:46939/myuberlite';

var createRecord = function(db, recordObj, callback){
      db.collection('record').insertOne(recordObj, function(err, writeResult){
        if(writeResult.result.ok !== 1){
          callback(err, null);
        }
        else{
          callback(null, writeResult);
        }
      });
};

module.exports.recordCreate = function(obj,callback){
  mongodb.connect(url, function(err, db){
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callback(err, null);
    }
    else{
      createRecord(db,obj,function(err, result){
        db.close();
        if(err){
          callback(err, null);
        }
        else {
          callback(null, result);
        }
      });
    }
  });
};

var findRecordByTime = function(db, start,end, callback){
  db.collection('record').find({ id: { $gt: start, $lt: end } }).toArray(function(err, thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
};

module.exports.getRecordByTime = function(start,end, callback){
  mongodb.connect(url,function(err,db){
    console.log(err);
    if(err){
      callback(err,null);
    }
    else {
      findRecordByTime(db,start,end,callback);
    }
  });
};

var findRecordByDescription= function(db, description, callback){
  db.collection('record').find({ description: new RegExp(description)}).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
};

module.exports.getRecordByDescription = function(description, callback){
  mongodb.connect(url,function(err,db){
    if(err){
      callback(err,null);
    }
    else {
      findRecordByDescription(db,description,callback);
    }
  });
};


var findRecordByMutiple= function(db, queryObject, callback){

  db.collection('record').find({ description: new RegExp(description)}).toArray(function(err,thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
};

module.exports.getRecordByMutiple = function(queryObject, callback){
  mongodb.connect(url,function(err,db){
    console.log(err);
    if(err){
      callback(err,null);
    }
    else {
      findRecordByMutiple(db,description,callback);
    }
  });
};

var findAllRecords = function(db, callback){
  db.collection('record').find().toArray(function(err, thing){
    db.close();
    if(thing){
      callback(null,thing);
    }
    else {
      callback(null,null);
    }
  });
};

module.exports.getAllRecords = function( callback){
  mongodb.connect(url,function(err,db){
    console.log(err);
    if(err){
      callback(err,null);
    }
    else {
      findAllRecords(db,callback);
    }
  });
};
