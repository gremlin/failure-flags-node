# failure-flags

Failure Flags is a node SDK for working with the Gremlin fault injection platform to build application-level chaos experiments and reliability tests. This library works in concert with Gremlin-Lambda, a Lambda extension, or Gremlin-Container a container sidecar agent. This architecture minimizes the impact to your application code, simplifies configuration, and makes adoption painless.

Just like feature flags, Failure Flags are safe to add to and leave in your application. Failure Flags will always fail safe if it cannot communicate with its sidecar or its sidecar is misconfigured.

You can get started by adding @gremlin/failure-flags to your package dependencies:

```sh
npm i --save @gremlin/failure-flags
```

Then instrument the part of your application where you want to inject faults. 

```js
const failureflags = require(`@gremlin/failure-flags`);

...

await failureflags.ifExperimentActive({
  name: 'flagname',                 // the name of your failure flag
  labels: {})                       // additional attibutes about this invocation

...
```

The best spots to add a failure flag are just before or just after a call to one of your network dependencies like a database or other network service. Or you can instrument your request handler and affect the way your application responses to its callers. Here's a simple Lambda example:

```js
// Note: you must bring in the failure-flags library
const gremlin = require('@gremlin/failure-flags');

module.exports.handler = async (event) => {
  start = Date.now();

  // If there is an experiment defined for this failure-flag, that is also
  // targeting the HTTP method and or path then this will express the 
  // effects it describes.
  await gremlin.ifExperimentActive({
    name: 'http-ingress',
    labels: { 
      method: event.requestContext.http.method,
      path: event.requestContext.http.path }});

  return {
    statusCode: 200,
    body: JSON.stringify(
      {processingTime: Date.now() - start, timestamp: event.requestContext.time},
      null,
      2
    ),
  };
};
```

You can always bring your own behaviors and effects by providing a behavior function. Here's another Lambda example that writes the experiment data to the console instead of changing the application behavior:

```js
// Note: you must bring in the failure-flags library
const gremlin = require('@gremlin/failure-flags');

module.exports.handler = async (event) => {
  start = Date.now();

  // If there is an experiment defined for this failure-flag, that is also
  // targeting the HTTP method and or path then this will express the 
  // effects it describes.
  await gremlin.ifExperimentActive({
    name: 'http-ingress',
    labels: { 
      method: event.requestContext.http.method,
      path: event.requestContext.http.path },
    behavior: async (experiment) => {
      console.log('handling the experiment', experiment);
    }});

  return {
    statusCode: 200,
    body: JSON.stringify(
      {processingTime: Date.now() - start, timestamp: event.requestContext.time},
      null,
      2
    ),
  };
};
```
