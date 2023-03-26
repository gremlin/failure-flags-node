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
  },
  defaultBehavior: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "1000",
      "exception": {}
    }
  },
  defaultBehaviorWithMessage: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "1000",
      "exception": { 'message': 'Custom message' }
    }
  },
  defaultBehaviorWithNoException: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "500",
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
  expect(await failureflags.ifExperimentActive({
    name: 'custom',
    labels: {a:'1',b:'2'},
    behavior: 'not a function',
   debug: false})).toBe(false);
});

test('ifExperimentActive does nothing if no experiment for failure flag', async () => {
  expect(await failureflags.ifExperimentActive({
    name: 'doesnotexist',
    labels: {a:'1',b:'2'},
    behavior: ()=>{},
    debug: false})).toBe(false);
});

test('ifExperimentActive does call callback', async () => {
  expect(await failureflags.ifExperimentActive({
    name: 'custom',
    labels: {a:'1',b:'2'},
    behavior: (t)=>{ console.log('callback called', t); }})).toBe(true);
});


test('ifExperimentActive default behavior is delayedException with default error message', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'defaultBehavior', 
      labels: {a:'1',b:'2'},
      debug: false});
    expect(true).toBe(false); // always reject if this line is reached.
  } catch(e) {
    expect(e).not.toBeNull();
    expect(e.message).toBe('Exception injected by Gremlin');
  }
});

test('ifExperimentActive default behavior is delayedException with custom error message', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'defaultBehaviorWithMessage', 
      labels: {a:'1',b:'2'},
      debug: false});
    expect(true).toBe(false); // always reject if this line is reached.
  } catch(e) {
    expect(e).not.toBeNull();
    expect(e.message).toBe('Custom message');
  }
});

test('ifExperimentActive default behavior is delayedException with no exception', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'defaultBehaviorWithNoException', 
      labels: {a:'1',b:'2'},
      debug: false});
  } catch(e) {
    expect(true).toBe(false); // always reject if this line is reached.
  }
});

afterAll(() => {
  mockServer.close();
});
