const flatLatency = async (experiment) => {
  if(experiment && experiment.effect && experiment.effect.latency)
    await timeout(parseInt(experiment.effect.latency, 10));
}

const exception = (experiment) => {
  if(experiment && experiment.effect && experiment.effect.exception) 
    if(experiment.effect.exception.message)
      throw new Error(experiment.effect.exception.message);
    else
      throw new Error('Exception injected by Gremlin');
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const delayedException = async (e) => {
  await flatLatency(e);
  exception(e);
}

module.exports = exports = { flatLatency, exception, delayedException };
