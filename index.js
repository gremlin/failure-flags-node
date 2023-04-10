const { fetchExperiment } = require('./src/fetch.js');
const effect = require('./src/fault.js');
const defaultBehavior = effect.delayedException;

const ifExperimentActive = async ({name, labels, behavior = defaultBehavior, debug = false}) => {
  if(debug) console.log('ifExperimentActive', name, labels);
  if (typeof behavior != 'function') {
    if(debug) console.log('behavior is not a function');
    return false;
  }

  let experiment = null;
  try {
    experiment = await fetchExperiment(name, labels, debug);
  } catch(ignore) {
    if(debug) console.log('unable to fetch experiment', ignore);
    return false;
  }

  if(experiment != null) {
    if(debug) console.log('fetched experiment', experiment);
    const dice = Math.random();
    if(experiment.rate && 
        typeof experiment.rate != "string" && 
        !isNaN(experiment.rate) &&
        experiment.rate >= 0 && 
        experiment.rate <= 1 &&
        dice > experiment.rate) {
      if(debug) console.log('probablistically skipped', behaviorError)
      return false;
    }
    
    try {
      await behavior(experiment);
    } catch(behaviorError) {
      if(debug) console.log('provided behavior error', behaviorError)
      throw behaviorError;
    }
    return true;
  }
  if(debug) console.log('no experiment for', name, labels);
  return false;
}

module.exports = exports = { ifExperimentActive, fetchExperiment, effect };
