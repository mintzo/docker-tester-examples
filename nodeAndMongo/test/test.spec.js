const TestingEnvironment = require('docker-tester');
const { expect } = require('chai');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const { seedDb } = require('./seedDB')

const isMongoReady = connectionString => new Promise(async (resolve, reject) => {
  MongoClient.connect(connectionString, { useNewUrlParser: true }, (error, client) => {
    if (error) { reject(error); } else {
      client.close();
      resolve();
    }
  });
});

// creating a verification function for docker-tester to check if the server/mongo is ready
const verifications = {
  httpServer: {
    verificationFunction: async (service) => {
      const urlToCheck = `http://localhost:${service.ports[0].external}`
      await axios.get(urlToCheck)
    }
  },
  mongo: {
    verificationFunction: async (service) => {
      const connectionString = `mongodb://localhost:${service.ports[0].external}`;
      await isMongoReady(connectionString);
    }
  }
};

const testingEnvironment = new TestingEnvironment({
  dockerComposeFileLocation: __dirname,
  dockerFileName: 'docker-compose.yml',
  verifications
});

// start all docker containers specified in the docker-compose before running the tests
before(async function () {
  this.timeout(0);
  await testingEnvironment.start();
});

// after all tests are done stop the docker containers
after(async function () {
  this.timeout(0);
  await testingEnvironment.stop();
});

// All services are up, before ruining these tests
describe('Docker-tester', async () => {
  let serverUrl;
  // set running service url, and seed the DB
  before(async () => {
    const nodeService = await testingEnvironment.getActiveService('node-service');
    const mongoService = await testingEnvironment.getActiveService('mongo-service');
    serverUrl = `http://localhost:${nodeService.ports[0].external}`;
    const connectionString = `mongodb://localhost:${mongoService.ports[0].external}`;
    await seedDb(connectionString)
  })

  describe('/movies', async () => {
    it('should return movies list', async () => {
      const results = (await axios.get(`${serverUrl}/movies`)).data;
      const expectedResults = [{ _id: 'avengers' }, { _id: 'spiderman' }, { _id: 'hulk' }];
      expect(results).to.deep.equal(expectedResults);
    });
  });

});
