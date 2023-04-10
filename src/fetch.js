const { request } = require('http');

const fetchExperiment = async (name, labels = {}, debug = false) => {
  if(debug) console.log('fetch experiment for', name, labels);
  return new Promise((resolve, reject) => {
    // input validation
    if(!name) {
      reject(new Error('invalida failure-flag name'));
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
              resolve(JSON.parse(out));
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

