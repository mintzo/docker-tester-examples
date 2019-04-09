const { MongoClient } = require('mongodb');

const seedDb = connectionString => new Promise(async (resolve, reject) => {
  MongoClient.connect(connectionString, { useNewUrlParser: true }, (error, client) => {
    if (error) { reject(error); } else {
      const db = client.db('Cinema');
      const collection = db.collection('movies');
      // Insert some documents
      collection.insertMany([
        { _id: 'avengers' }, { _id: 'spiderman' }, { _id: 'hulk' }
      ], (err, result) => {
        client.close();
        resolve();
      });
    }
  });
})

module.exports = { seedDb }