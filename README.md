# failure-flags-node

```js
const failureflags = require(`@allingeek-gremlin/failure-flags`);

await failureflags.ifExperimentActive(
  'flagname',                       // the name of your failure flag
  {},                               // additional attibutes about this invocation
  failureflags.effect.flatLatency;) // an off-the-shelf impact
```
