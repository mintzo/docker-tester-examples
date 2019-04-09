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
};

const testingEnvironment = new TestingEnvironment({
  dockerComposeFileLocation: __dirname,
  dockerFileName: 'test.docker-compose.yml',
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
describe('Docker-tester',async () => {
  let serverUrl;
  // set running service url
  before(async()=>{
    const serviceName = 'node-service';
    serverUrl = `http://localhost:${(await testingEnvironment.getActiveService(serviceName)).ports[0].external}`;
  })

  describe('/test', async() => {
    it('should return sample string', async () => {
      const results = (await axios.get(`${serverUrl}/test`)).data;
      const expectedResults = 'simple response';
      expect(results).to.equal(expectedResults);
    });
  });
  describe('/book', async() => {
    it('should return sample json', async () => {
      const results = (await axios.get(`${serverUrl}/book/example`)).data;
      const expectedResults = { id: 'example', name: 'example' };
      expect(results).to.deep.equal(expectedResults);
    });
    it('should return sample json', async () => {
      const results = (await axios.get(`${serverUrl}/book/test`)).data;
      const expectedResults = { id: 'test', name: 'example' };
      expect(results).to.deep.equal(expectedResults);
    });
  });

});
