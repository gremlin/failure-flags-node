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
const latency = async (experiment) => {
  if (!experiment.effect.latency)
    return;

  const latency = experiment.effect.latency;
  if(typeof latency === "number") {
    await timeout(latency);
  } else if(typeof latency === "string") {
    await timeout(parseInt(latency, 10));
  } else if(typeof latency === "object") {
    let ms = (latency.ms && typeof latency.ms === "number")? latency.ms : 0;
    let jitter = (latency.jitter && typeof latency.jitter === "number")? latency.jitter * Math.random() : 0;
    await timeout(ms + jitter);
  }
}

const exception = (experiment) => {
  if (!experiment.effect.exception)
    return;

  const exception = experiment.effect.exception;
  if (typeof exception === "string") {
    throw new Error(exception);
  } else if (typeof exception === "object") {
    let toThrow = new Error('Exception injected by Failure Flags');
    Object.assign(toThrow, exception)
    throw toThrow;
  }
}

const response = async (experiment, prototype) => {
  if (!experiment.effect.response || typeof experiment.effect.response !== "object" || !prototype )
    return;

  const response = experiment.effect.response;
  const res = Object.create(prototype);
  Object.assign(res, response);
  return res;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const delayedException = async (e) => {
  await latency(e);
  exception(e);
}

const delayedResponseOrException = async (e, responsePrototype) => {
  await latency(e);
  exception(e);
  return response(e, responsePrototype);
}

module.exports = exports = { latency, exception, response, delayedException, delayedResponseOrException };
