const pg = require('pg');

let _clientPromise;
const connect = ()=> {
  if(_clientPromise) return _clientPromise;
  _clientPromise = new Promise( (resolve, reject)=> {
    const client = new pg.Client(process.env.DATABASE_URL);
    client.connect( err => {
      if(err) return reject(err);
      resolve(client);
    });
  });
  return _clientPromise;
};

const seed = ()=> {
  return connect()
    .then( (client)=> {
      return createTweet('prof', 'hi');
    })
    .then( client => {
      return createTweet('prof', 'hi again');
    })
    .then( (client)=> {
      return createTweet('alex', 'hello');
    })
    .then( (client)=> {
      return createTweet('kris', 'bye');
    });
}

const query = (sql, params)=> {
  params = params || [];
  return connect()
    .then( client => {
      return new Promise( (resolve, reject)=> {
        client.query(sql, params, (err, result)=> {
          if(err) return reject(err);
          resolve(result.rows);
        });
      });
    });
};

const createUser = (name)=> {
  return query('insert into users (name) values ($1) returning id', [name]);
};

const createTweet = (name, content)=> {
  return query('select id from users where name = $1', [name])
    .then( users=> {
      if(users.length)
        return users;
      return createUser(name)
    })
    .then( users => {
      const userId = users[0].id;
      query('insert into tweets(user_id, content) values ($1, $2)', [ userId, content ]);
    });
};

const sync = ()=> {
  const sql = `
    DROP TABLE IF EXISTS tweets; 
    DROP TABLE IF EXISTS users; 
    CREATE TABLE users(
        id SERIAL primary key,
        name text
    );
    CREATE TABLE tweets(
        id SERIAL primary key,
        content text,
        user_id integer references users(id)
    );
    `;
    return query(sql);
};

const getUsers = ()=> {
  return query('select * from users');
};

const getTweets = (name)=> {
  let sql = `
    SELECT users.name, tweets.id, tweets.user_id, tweets.content
    FROM tweets
    JOIN users
    ON users.id = tweets.user_id
    `;
  const params = [];
  if(name){
    sql = `${sql} where users.name = $1`;
    params.push(name);
  }
  return query(sql, params);
};

module.exports = {
  getTweets,
  getUsers,
  sync,
  seed,
  createTweet
};
