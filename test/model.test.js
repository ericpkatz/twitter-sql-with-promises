const expect = require('chai').expect;
const db = require('../db');

describe('tweeting', ()=> {
  let tweets = [];
  beforeEach((done)=> {
    db.sync()
      .then(()=> {
        return db.seed();
      })
      .then( ()=> {
        return db.getTweets();
      })
      .then( _tweets => {
        tweets = _tweets;
        done();
      })
      .catch( (err)=> done(err));

  });

  it('there are four tweets', ()=> {
    expect(tweets.length).to.equal(4);
  });
});
