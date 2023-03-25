const { fetchExperiment } = require('./src/fetch.js');

const ifExperimentActive = async (name, attributes, behavior, debug = false) => {
  if(debug) console.log('ifExperimentActive', name, attributes);
  if (typeof behavior != 'function') {
    if(debug) console.log('behavior is not a function');
    return false;
  }

  try {
    const experiment = await fetchExperiment(name, attributes);
    if(experiment != null) {
      if(debug) console.log('fetched', experiment);
      await behavior(experiment);
      return true;
    }
    if(debug) console.log('fetched was null');
    return false;
  } catch(ignore) {
    if(debug) console.log('unable to fetch experiment', ignore);
    return false;
  }
  return false;
}

module.exports = exports = { ifExperimentActive, fetchExperiment };
