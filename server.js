const express = require('express');
const swig = require('swig');
swig.setDefaults({ cache: false });

const db = require('./db');

const app = express();
app.use(require('body-parser').urlencoded({extended: false}));

app.set('view engine', 'html');
app.engine('html', swig.renderFile);

app.get('/:name?', (req, res, next)=> {
  Promise.all([ db.getTweets(req.params.name), db.getUsers()])
    .then((result)=> {
      res.render('index', { name: req.params.name, tweets: result[0], users: result[1] });
    })
    .catch( err => next(err));
});

app.post('/', (req, res, next)=> {
  db.createTweet(req.body.name, req.body.content)
    .then( ()=> res.redirect(`/${req.body.name}`));
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
