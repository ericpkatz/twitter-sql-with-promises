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
      return createUser('prof');
    })
    .then( (client)=> {
      return createUser('alex');
    })
    .then( (client)=> {
      return createUser('kris');
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
        })
      });
    });
};

const createUser = (name)=> {
  return query('insert into users (name) values ($1)', [name]);
};

const sync = ()=> {
  return connect()
    .then( (client)=> {
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
      return new Promise( (resolve, reject)=> {
        client.query(sql, (err)=> {
          if(err) return reject(err);
          resolve();
        });
      });
    });
};

const getTweets = ()=> {
  return new Promise( (resolve, reject)=> {
    resolve([ 'foo', 'bar' ]);
  });
};

module.exports = {
  getTweets,
  sync,
  seed
};
