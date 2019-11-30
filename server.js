var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var multer  = require('multer')
var express = require('express');
var session = require('cookie-session');
var app = module.exports = express();
var {ObjectId} = require('mongodb'); 
var bodyParser = require('body-parser');


app.set('trust proxy',1);
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'danny',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge:86400} 
  }));

app.use(function(req, res, next) {
    res.locals.login = req.session.login;
    res.locals.username = req.session.username;
  

    next();
  });

var url = 'mongodb+srv://Danny:qaz1234@comps381f-l6eyl.mongodb.net/test?retryWrites=true&w=majority';
var MongoClient = require('mongodb').MongoClient;
var new_r = {};


app.listen(app.listen(process.env.PORT || 8099 ))

app.get('/', function(req,res) {
    res.redirect('/login')
});
app.get('/logout', function(req,res) {
    req.locals = null;
    req.session = null;
    res.redirect('/login')
});

app.get('/login', function(req,res) {
    //let username = req.query.username;
    //console.log(req.query.username);
    //console.log(req.body.password);
    res.render('login',
         { login:req.session.login,
            username:req.session.username}
                );
});

app.post('/login', function(req,res) { 
    const { username, password } = req.body;
   // if (!username || !password ) {
  //      res.send( 'Please fill in all fields' );
   // }else
        MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        //Write databse Insert/Update/Query code here..
        var db2 = db.db("pj381f");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 
        var user = { name: req.body.username , password: req.body.password  }; 
            db2.collection("user").findOne(user,function(err, result) {
                db.close();
            if (result != null) {
                console.log(result);
                req.session.login = true;
                console.log(req.session.login);
                req.session.username = req.body.username;
                res.redirect('/index') 
            }
            else{
                res.send('wrong ac');
            // close the connection to db when you are done with it
            db.close(); }
            }); 
            //res.render('index');   
            
       });  
      
});
app.get('/register', (req, res) => {
    res.render('register');
   });
app.post('/register', function(req,res) { 
    const { username, password } = req.body;
    //if (!username || !password ) {
    //    res.send( 'Please fill in all fields' );
  //  }else
        MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        //Write databse Insert/Update/Query code here..
        var db2 = db.db("pj381f");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 
        var user = { name: req.body.username , password: req.body.password  }; 
            db2.collection("user").insertOne(user, function(err, res) {
            if (err) throw err;
            db.close();
            console.log("user registered");
            // close the connection to db when you are done with it
            db.close();
            }); 
            
            res.send('user registered');
       });   
});

app.get('/rate', (req, res) => {
    res.render('rate' ,{ id:req.query._id , name:req.query.ratename});
   });
app.post('/rate', (req, res) => {  

    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        var db2 = db.db("pj381f");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 

        var user = { name:req.body.ratename , _id:ObjectId( req.body.uid ) }; 
        console.log(user);
            db2.collection("restaurant").findOne(user,function(err, result) {
                if( result.owner != req.session.username ) {
                var id = { _id : ObjectId( req.body.uid ) , name : result.owner }; 
                var newvalues = {$set: {        
                    grades: { user: req.session.username,
                        score: req.body.ratename,
                     },
                    } };
                        db2.collection("restaurant").updateOne( id ,newvalues, function(err, res) {
                            if (err) throw err;
                                console.log("You"+ req.session.username +" has rated " + result.owner );      
                                    db.close();
                            }); 
                        }else{
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('You cannot Rate Yourself.');
                            res.write('<form action="/index">');
                            res.write('<input type="submit" value="Go Back"/>');
                            res.write('</form>');
                            res.end();

                        }
            });


        });

   });
app.get('/index', (req, res) => {
    if ( !req.session.login )
        res.redirect('/login')
    else {
    /////////////////////If session existed, next step//////////////////
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        var db2 = db.db("pj381f");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 

        db2.collection("restaurant").find({}).toArray(function(err, data) {
            db.close();
           // console.log(result[0].name);  
                res.render('index', {result: data})
            });
        });
    }
   // res.render('index');
   });


app.post('/index', (req, res) => {
    res.render('index');
   });


app.get('/display', (req, res) => {
    if ( !req.session.login )
        res.redirect('/login')
    else {
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        //Write databse Insert/Update/Query code here..
        var db2 = db.db("pj381f");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 
       // res.writeHead(200,{"Content-Type": "text/html"});
      //  res.write('<html><body>');
     //   res.write('Hello   ' + req.session.username );
        
        var id = { _id : ObjectId(req.query._id) }; 
        console.log(req.query._id);
            db2.collection("restaurant").findOne(id,function(err, data) {
            if (data != null) {
                db.close();
                    res.render('display', { result: data  });     
            }       
            else{
                console.log('null');
              //  res.end('</form></body></html>');
                db.close(); }
            }); 
        }); 
    }//end else 
   });

app.get('/update', (req, res) => {
    if ( !req.session.login )
    res.redirect('/login')
        else {
        MongoClient.connect(url, function (err, db) {
            if(err) throw err;
            //Write databse Insert/Update/Query code here..
            var db2 = db.db("pj381f");
            console.log('mongodb is running!');
            console.log("Switched to "+db2.databaseName+" database"); 
            var id = { _id : ObjectId(req.query._id) }; 
            console.log(id);

                db2.collection("restaurant").findOne(id,function(err, data) {
                if (data != null) {
                    db.close();
                    res.render('update' , { result: data, key:id  } );
                }
                else{
                    console.log('null');
                    db.close(); }
                }); 
            
        });//end else 
    }         
        
});

app.post('/update', function(req, res, next){
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log('2');
        console.log(req.session.username + fields.owner);
        if ( req.session.username == fields.owner ) {
            console.log('3');
        // console.log(JSON.stringify(files));
            const filename = files.filetoupload.path;
            let title = "untitled";
            //
            let description = "n/a"
            //
            let mimetype = "images/jpeg";
            if (fields.title && fields.title.length > 0) {
                title = fields.title;
            }
            //
            if (fields.description && fields.description.length > 1) {
                description = fields.description;
            }
            //
            if (files.filetoupload.type) {
                mimetype = files.filetoupload.type;
            }
                fs.readFile(files.filetoupload.path, (err,data) => {    
                            MongoClient.connect(url, function (err, db) {
                            const db2 = db.db('pj381f');
                            new_r['title'] = title;
                            //
                            new_r['description'] = description;
                            //
                            new_r['mimetype'] = mimetype;
                            new_r['image'] = new Buffer.from(data).toString('base64');

                            var _coord = { latitude: fields.latitude , longitude: fields.longitude};
                            var id = { _id : ObjectId( fields.key ) }; 
                            var newvalues = {$set: {        
                                    name: fields.name , 
                                    borough: fields.borough,
                                    cuisine: fields.cuisine,
                                    photo: new_r['image'],
                                    mimetype: new_r['mimetype'],
                                    address: { street: fields.street,
                                        building: fields.building,
                                        zipcode: fields.zipcode,
                                        street: fields.street,
                                        coord: _coord,
                            },
                            } };
                            console.log(newvalues);
                            db2.collection("restaurant").updateOne( id ,newvalues, function(err, res) {
                                if (err) throw err;
                                    console.log("Document Updated");      
                                        db.close();
                            }); 
                         })
                });
    };

        res.redirect('/index');


        });
    });
    



app.get('/Create', (req, res) => {
    res.render('Create');
   });


app.post('/create', function(req, res, next){
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log('2');
        // console.log(JSON.stringify(files));
            const filename = files.filetoupload.path;
            let title = "untitled";
            //
            let description = "n/a"
            //
            let mimetype = "images/jpeg";
            if (fields.title && fields.title.length > 0) {
                title = fields.title;
            }
            //
            if (fields.description && fields.description.length > 1) {
                description = fields.description;
            }
            //
            if (files.filetoupload.type) {
                mimetype = files.filetoupload.type;
            }
           fs.readFile(files.filetoupload.path, (err,data) => {    
                    MongoClient.connect(url, function (err, db) {
                    const db2 = db.db('pj381f');
                    new_r['title'] = title;
                    new_r['description'] = description;
                    new_r['mimetype'] = mimetype;
                    new_r['image'] = new Buffer.from(data).toString('base64');

                    var _coord = { latitude: fields.latitude , longitude: fields.longitude};
                    var doc = { restaurant_id: fields.r_id ,
                                name: fields.name , 
                               borough: fields.borough,
                               cuisine: fields.cuisine,
                               photo: new_r['image'],
                               mimetype: new_r['mimetype'],
                               address: { street: fields.street,
                                   building: fields.building,
                                   zipcode: fields.zipcode,
                                   street: fields.street,
                                   coord: _coord,
                               },
                               grades: { user: req.body.user, score: req.body.score },
                               owner: req.session.username,
                    }; 
                    console.log(doc);
                    db2.collection("restaurant").insertOne(doc, function(err, res) {
                        if (err) throw err;
                            console.log("Document inserted");      
                                db.close();
                             }); 
                               })
        });

        res.redirect('/index');

    });
});
    







//app.get('/login', function(req,res) { 
  //  authenticate(req.body.username, req.body.password, function(err, user){
        
//});

//git add .
//git commit -m '版本訊息'
//git push heroku master

// 