const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/movies', (req, res) => {
  const connectionString = `mongodb://mongo-ip:27017`;
  MongoClient.connect(connectionString, { useNewUrlParser: true }, (error, client) => {
    if (error) { throw error } else {
      client.db('Cinema').collection('movies').find({}).toArray((err, docs) => {
        res.json(docs)
      })
    }
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))