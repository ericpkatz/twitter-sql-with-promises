const express = require('express');
const swig = require('swig');
swig.setDefaults({ cache: false });

const db = require('./db');

const app = express();

app.set('view engine', 'html');
app.engine('html', swig.renderFile);

app.get('/', (req, res, next)=> {
  db.getTweets()
    .then( tweets => {
      res.render('index', { tweets });
    });
});

const port = process.env.PORT || 3000;

db.sync()
  .then( ()=> {
    console.log('your database is synced!!!');
  })
  .then( ()=> {
    return db.seed();
  })
  .catch( err => console.log(err)); 

app.listen(port, ()=> console.log(`listening on port ${port}`));
