/*
Copyright 2023 Gremlin, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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
      "latency-flat": "10"
    }
  },
  defaultList: [{
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultList",
    rate: "0.5",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "10",
      "exception": {}
    }
  }],
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
  defaultBehaviorZeroRate: [{
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehaviorZeroRate",
    rate: 0,
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "10",
      "exception": {}
    }
  },{
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehaviorZeroRate",
    rate: 0,
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      "latency": "20"
    }
  }],
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
  latencySupportsNumber: [{
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      latency: 11
    }
  }],
  latencySupportsString: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "defaultBehavior",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      latency: "12"
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
      }
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
  alteredResponseValue: {
    guid: "6884c0df-ed70-4bc8-84c0-dfed703bc8a7",
    failureFlagName: "alteredResponseValue",
    rate: "1",
    selector: {
      "a":"1",
      "b":"2"
    },
    effect: {
      data: {
        property2: "experiment value",
        property3: "experiment originated",
      }
    }
  },

};

let mockServer = {};

beforeAll(() => {
  // enable failure flags
  process.env.FAILURE_FLAGS_ENABLED = "true"

  // setup simple express server to serve a mock gremlin-lambda service
  const app = express();
  app.use(express.json());
  app.post('/experiment', (req, res) => {
    res.status(200).json(responses[req.body.name]);
  });
  mockServer = app.listen('5032', 'localhost');
});

afterEach(() => {
  process.env.FAILURE_FLAGS_ENABLED = "true"
})

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

test('ifExperimentActive does nothing if FAILURE_FLAGS_ENABLED is not truthy', async () => {
  delete process.env.FAILURE_FLAGS_ENABLED
  expect(await failureflags.ifExperimentActive({
    name: 'custom',
    labels: {a:'1',b:'2'}})).toBe(false);
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('ifExperimentActive does nothing if all experiments probablistically skipped', async () => {
  try {
  expect(await failureflags.ifExperimentActive({
    name: 'defaultBehaviorZeroRate',
    labels: {a:'1',b:'2'},
    debug: false})).toBe(true);
  } catch(e) {
    expect(true).toBe(false);
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('around / instead example', async () => {
  if (!await failureflags.ifExperimentActive({name:'custom'})) {
    expect(true).toBe(false); // always reject if this line is reached.
  }
  if (await failureflags.ifExperimentActive({name:'defaultBehaviorWithNoException'}) === true) {
    expect(setTimeout).toHaveBeenCalledTimes(1);
  }
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

test('ifExperimentActive true if dataPrototype unset and experiment active', async () => {
  try {
    const response = await failureflags.ifExperimentActive({
      name: 'defaultBehaviorWithNoException',
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.data, // explicitly test the exception effect, not default
      debug: false});
    expect(response).toBe(true);
  } catch(e) {
    expect(true).toBe(false); // always reject if this line is reached.
  }
  // the 'response' behavior does not use setTimeout
  expect(setTimeout).toHaveBeenCalledTimes(0);
});

test('ifExperimentActive returns derrived if dataPrototype set and experiment active', async () => {
  let data = { property1: 'prototype value', property2: 'prototype value' };
  try {
    data = await failureflags.ifExperimentActive({
      name: 'alteredResponseValue',
      labels: {a:'1',b:'2'},
      behavior: failureflags.effect.data, // explicitly test the exception effect, not default
      dataPrototype: data,
      debug: false});
  } catch(e) {
    console.dir(e);
    expect(true).toBe(false); // always reject if this line is reached.
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
  expect(data).toHaveProperty('property1', 'prototype value');
  expect(data).toHaveProperty('property2', 'experiment value');
  expect(data).toHaveProperty('property3', 'experiment originated');
});

test('ifExperimentActive returns dataPrototype if dataPrototype is set and no experiment active', async () => {
  let response = {property1: "prototype value"};
  try {
    response = await failureflags.ifExperimentActive({
      name: 'doesnotexist',
      labels: {a:'1',b:'2'},
      behavior: (experiment) => { return false; }, // explicitly destroy the prototype
      dataPrototype: {property1: 'prototype value', property2: 'prototype value'},
      debug: false});
  } catch(e) {
    console.dir(e);
    expect(true).toBe(false); // always reject if this line is reached.
  }
  expect(setTimeout).toHaveBeenCalledTimes(0);
  expect(response).toHaveProperty('property1', 'prototype value');
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  mockServer.close();
});
