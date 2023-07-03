const latency = async (experiment) => {
  const effect = experiment.effect;

  if(experiment && experiment.effect && effect.latency && effect.latency && typeof effect.latency === "number") {
    await timeout(experiment.effect.latency);
  } else if(experiment && experiment.effect && effect.latency && effect.latency && typeof effect.latency === "string") {
    await timeout(parseInt(experiment.effect.latency, 10));
  } else if(experiment && experiment.effect && effect.latency && effect.latency && typeof effect.latency === "object") {
    let ms = (effect.latency.ms && typeof effect.latency.ms === "number")? effect.latency.ms : 0;
    let jitter = (effect.latency.jitter && typeof effect.latency.jitter === "number")? effect.latency.jitter * Math.random() : 0;
    await timeout(ms + jitter);
  }
}

const exception = (experiment) => {
  const effect = experiment.effect;

  if(experiment && experiment.effect && effect.exception) {
    const exception = effect.exception;

    if (typeof exception === "string") {
      throw new Error(exception);
    } else if (typeof exception === "object") {
      let toThrow = new Error('Exception injected by Failure Flags');
      Object.assign(toThrow, exception)
      throw toThrow;
    }
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const delayedException = async (e) => {
  await latency(e);
  exception(e);
}

module.exports = exports = { latency, exception, delayedException };
