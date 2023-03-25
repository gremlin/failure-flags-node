const failureflags = require('./index.js');
const express = require('express');

let requests = {
  custom: {
    name: "custom",
    labels: {
      a: "1",
      b: "2"
    }
  }
};

let responses = {
  custom: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "custom",
    rate: "0.5",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency-flat": "6000"
    }
  }
};

let mockServer = {};

beforeAll(() => {
  // setup simple express server to serve a mock gremlin-lambda service
  const app = express();
  app.use(express.json());
  app.post('/experiment', (req, res) => {
    res.status(200).json(responses[req.body.name]);
  });
  mockServer = app.listen('5032', 'localhost');
});

test('ifExperimentActive does nothing if callback is not a function', async () => {
  expect(await failureflags.ifExperimentActive('custom', {a:'1',b:'2'}, 'not a function', false)).toBe(false);
});

test('ifExperimentActive does nothing if no experiment for failure flag', async () => {
  expect(await failureflags.ifExperimentActive('doesnotexist', {a:'1',b:'2'}, ()=>{}, false)).toBe(false);
});

test('ifExperimentActive does call callback', async () => {
  expect(await failureflags.ifExperimentActive('custom', {a:'1',b:'2'}, (t)=>{ console.log('callback called', t); })).toBe(true);
});

test('ifExperimentActive returns true if used experiment but behavior threw exception', async () => {
  expect(await failureflags.ifExperimentActive('custom', {a:'1',b:'2'}, (t)=>{ throw 'any'; })).toBe(true);
});


afterAll(() => {
  mockServer.close();
});
