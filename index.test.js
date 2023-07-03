const failureflags = require('./index.js');
const express = require('express');

class CustomError {}

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
      "latency-flat": "10"
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
      "latency": "10",
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
      "latency": "10",
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
      "latency": "50",
    }
  },
  latencySupportsNumber: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      latency: 11,
    }
  },
  latencySupportsString: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      latency: "12",
    }
  },
  latencySupportsObject: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      latency: {
        ms: 13,
        jitter: 0
      },
    }
  },
  exceptionSupportsString: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      exception: "custom message"
    }
  },
  exceptionSupportsExtraProperties: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      exception: {
        extraProperty: "some extra value"
      },
    }
  },
  exceptionSupportsExtraPropertiesAndMessage: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      exception: {
        message: "custom message",
        extraProperty: "some extra value"
      },
    }
  },
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

jest.spyOn(global, 'setTimeout');

test('ifExperimentActive does nothing if callback is not a function', async () => {
  expect(await failureflags.ifExperimentActive({
    name: 'custom',
    labels: {a:'1',b:'2'},
    behavior: 'not a function',
   debug: false})).toBe(false);
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('ifExperimentActive does nothing if no experiment for failure flag', async () => {
  expect(await failureflags.ifExperimentActive({
    name: 'doesnotexist',
    labels: {a:'1',b:'2'},
    behavior: ()=>{},
    debug: false})).toBe(false);
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('ifExperimentActive does call callback', async () => {
  expect(await failureflags.ifExperimentActive({
    name: 'custom',
    labels: {a:'1',b:'2'},
    behavior: (t)=>{ console.log('callback called', t); }})).toBe(true);
  expect(setTimeout).toHaveBeenCalledTimes(0);
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
    expect(e.message).toBe('Exception injected by Failure Flags');
  }
  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10);
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
  expect(setTimeout).toHaveBeenCalledTimes(1);
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
  expect(setTimeout).toHaveBeenCalledTimes(1);
});

test('latency supports number', async () => {
  jest.spyOn(global, 'setTimeout');

  await failureflags.ifExperimentActive({
      name: 'latencySupportsNumber', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.latency,
      debug: false});

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 11);
});

test('latency supports string', async () => {
  await failureflags.ifExperimentActive({
      name: 'latencySupportsString', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.latency,
      debug: false});

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 12);
});

test('latency supports object', async () => {
  await failureflags.ifExperimentActive({
      name: 'latencySupportsObject', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.latency,
      debug: false});

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 13);
});

test('exception supports string', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'exceptionSupportsString', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.exception, // explicitly test the exception effect, not default
      debug: false});
    expect(true).toBe(false); // always reject if this line is reached.
  } catch(e) {
    expect(e).not.toBeNull();
    expect(e.message).toBe('custom message');
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('exception supports extra properties', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'exceptionSupportsExtraProperties', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.exception, // explicitly test the exception effect, not default
      debug: false});
    expect(true).toBe(false); // always reject if this line is reached.
  } catch(e) {
    expect(e).not.toBeNull();
    expect(e).toHaveProperty('message', 'Exception injected by Failure Flags');
    expect(e).toHaveProperty('extraProperty', 'some extra value');
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('exception supports extra properties and custom message', async () => {
  try {
    await failureflags.ifExperimentActive({
      name: 'exceptionSupportsExtraPropertiesAndMessage', 
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.exception, // explicitly test the exception effect, not default
      debug: false});
    expect(true).toBe(false); // always reject if this line is reached.
  } catch(e) {
    expect(e).not.toBeNull();
    expect(e).toHaveProperty('message', 'custom message');
    expect(e).toHaveProperty('extraProperty', 'some extra value');
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  mockServer.close();
});
