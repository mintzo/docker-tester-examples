const TestingEnvironment = require('docker-tester');
const { expect } = require('chai');
const axios = require('axios');

// creating a verification function for docker-tester to check if the server is ready
const verifications = {
  httpServer: {
    verificationFunction: async (service) => {
      const urlToCheck = `http://localhost:${service.ports[0].external}`
      await axios.get(urlToCheck)
    }
  }
}

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
    serverUrl = `http://localhost:${nodeService.ports[0].external}`;
  })

  describe('/test', async () => {
    it('should return sample string', async () => {
      const results = (await axios.get(`${serverUrl}/test`)).data;
      const expectedResults = 'simple response';
      expect(results).to.equal(expectedResults);
    });
  });
  describe('/movies', async () => {
    it('should return sample json', async () => {
      const results = (await axios.get(`${serverUrl}/movies/avengers`)).data;
      const expectedResults = { id: 'avengers', name: 'example' };
      expect(results).to.deep.equal(expectedResults);
    });
    it('should return sample json', async () => {
      const results = (await axios.get(`${serverUrl}/movies/spiderman`)).data;
      const expectedResults = { id: 'spiderman', name: 'example' };
      expect(results).to.deep.equal(expectedResults);
    });
  });

});
