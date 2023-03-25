import { setTimeout } from 'timers';

const flatLatency = async (experiment) => {
  if(experiment && experiment.effect && experiment.effect.latency)
    await timeout(parseInt(experiment.effect.latency, 10));
}

const exception = async (experiment, message = 'Exception injected by Gremlin') => {
  if(experiment && experiment.effect && experiment.effect.exception) 
    throw new Error(message)
}


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { flatLatency, exception};
