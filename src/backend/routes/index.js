var express = require('express');
var router = express.Router();
var db = require('../db')

// router.get('/', function(req, res, next) {
//   res.json({success:true, name:"index"});
// });

router.post('/races/get', function(req, res) {
  if (!req.body.user) {
    return res.json({success:false, error:'You have to provide parameters (user)'});
  }

  db.racesTable.get(req.body.user, function (err, doc) {
    if (err){
      return res.json({success:false, error:err});
    }
    return res.json({success:true, data: doc});
  });

  // (err)=>{
     // if (err){
     //   var returnvalue = {success:false, error:err};
     //   res.json(returnvalue);
     // }
     // res.json({success:true});
  //  }
  console.log("WWWW");

  // return res.json({success:true});
});

router.post('/users/get', function(req, res) {
  if (!req.body.user) {
    return res.json({success:false, error:'You have to provide parameters (user)'});
  }

  db.usersTable.get(req.body.user, function (err, doc) {
    if (err){
      return res.json({success:false, error:err});
    }
    return res.json({success:true, data: doc});
  });
});



router.post('/races/add', function(req, res) {
  if (!req.body.user) {
    return res.json({success:false, error:'You have to provide parameters (user)'});
  }

  db.racesTable.get(req.body.user, function (err, doc) {
    if (err){
      return res.json({success:false, error:err});
    }

    doc.races.push(req.body);
    db.racesTable.save(req.body.user, doc, function (err, doc) {
      if (err){
        return res.json({success:false, error:err});
      }

      return res.json({success:true, data:doc});
    });
  });
});


// CRUD
// create
// read
// update

// db.users.merge(user, {win: response.win}, function (err, response) {
//    if (err) {
//      return res.json({success:false, error:err});
//    } else {
//      return res.json({success:true});
//    }
//  });
// delete

router.post('/users/newuser', function(req, res) {
  if (!req.body.name || !req.body.password) {
    return res.json({success:false, error:'You have to provide parameters (name,password)'});
  }

  const newUser = req.body

  db.usersTable.save(req.body.name, newUser, (err)=>{
    if (err){
      return res.json({success:false, error:err});
    }
    db.racesTable.save(req.body.name, {races:[]}, (err)=>{
      if (err){
        return res.json({success:false, error:err});
      }
      return res.json({success:true});
    });
  });

});


router.post('/users/login', function(req, res) {
  if (!req.body.name || !req.body.password) {
    return res.json({success:false, error:'You have to provide parameters (name,password)'});
  }

  const name = req.body.name;
  const submittedPassword = req.body.password;

  db.usersTable.get(name, function (err, doc) {
    if (err){
      if(err.reason == 'missing')
        return res.json({success:false, error:'There is no such user'});
    }

    const userPassword = doc.password
    if (submittedPassword == userPassword){
      res.json({success:true});
    } else {
      return res.json({success:false, error:'Password is incorrect'});
    }

  });

});



module.exports = router;
