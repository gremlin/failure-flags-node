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
const { fetchExperiment } = require('./src/fetch.js');
const effect = require('./src/fault.js');
const defaultBehavior = effect.delayedDataOrException;

const invokeFailureFlag = async ({name, labels, behavior = defaultBehavior, dataPrototype = null, debug = false}) => {
  if(debug) console.log('invokeFailureFlag', name, labels, dataPrototype);
  if (typeof behavior != 'function') {
    if(debug) console.log('behavior is not a function');
    return resolveOrFalse(debug, dataPrototype);
  }

  let experiments = null;
  try {
    experiments = await fetchExperiment(name, labels, debug);
  } catch(ignore) {
    if(debug) console.log('unable to fetch experiments', ignore);
    return resolveOrFalse(debug, dataPrototype);
  }

  if(experiments == null) {
    if(debug) console.log('no experiments for', name, labels);
    return resolveOrFalse(debug, dataPrototype);
  }
  if(!Array.isArray(experiments)) {
    experiments = [experiments]
  }

  if(debug) console.log('fetched experiments: ', experiments);
  const dice = Math.random();
  filteredExperiments = experiments.filter((experiment) => {
    if(typeof experiment.rate == "number" &&
        !isNaN(experiment.rate) &&
        experiment.rate >= 0 &&
        experiment.rate <= 1 &&
        dice > experiment.rate) {
      return false;
    }
    return true;
  });
  if(debug) console.log('filtered experiments: ', filteredExperiments);

  try {
    if (dataPrototype) {
      return await behavior(filteredExperiments, dataPrototype);
    } else {
      await behavior(filteredExperiments);
      return true;
    }
  } catch(behaviorError) {
    if(debug) console.log('provided behavior error', behaviorError)
    throw behaviorError;
  }
}

const resolveOrFalse = (debug, dataPrototype) => {
  let value = dataPrototype? dataPrototype : false;
  if(debug) console.log('returning', value);
  return value;
}

module.exports = exports = { invokeFailureFlag, fetchExperiment, effect, defaultBehavior };
