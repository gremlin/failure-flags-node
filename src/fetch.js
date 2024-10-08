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
const { request } = require('http');
var pjson = require('../package.json');

const fetchExperiment = async (name, labels = {}, debug = false) => {
  labels["failure-flags-sdk-version"] = "node-v" + pjson.version;

  if(debug) console.log('fetch experiment for', name, labels);

  return new Promise((resolve, reject) => {
    if(!process.env.FAILURE_FLAGS_ENABLED || !(process.env.FAILURE_FLAGS_ENABLED === "true" || process.env.FAILURE_FLAGS_ENABLED === "1")) {
      reject(new Error('failure flags is not enabled'));
      return
    }
    // input validation
    if(!name) {
      reject(new Error('invalid failure-flag name'));
      return
    }
    const postData = JSON.stringify({
      'name': name,
      'labels': labels
    })
    const req = request({
        hostname: 'localhost',
        port: '5032',
        path: '/experiment',
        method: 'POST',
        timeout: 1000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        const body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => {
          const out = Buffer.concat(body).toString();
          if (res.statusCode < 200 || res.statusCode > 299) {
            return reject(new Error(`HTTP status code: ${res.statusCode}, message: ${res.statusMessage}, body: ${out}`));
          } else {
            try {
              const rawResult = JSON.parse(out);
              resolve(rawResult);
            } catch(ignore) {
              resolve(null);
            }
	  }
        });
      });
    req.on('error', (err) => {
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.write(postData);
    req.end();
  })
};

module.exports = exports = { fetchExperiment };

