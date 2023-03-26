const { request } = require('http');

const fetchExperiment = async (name, attributes, debug = false) => {
  if(debug) console.log('fetch experiment for', name, attributes);
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      'name': name,
      'labels': attributes
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
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`HTTP status code ${res.statusCode}`));
	}
        const body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => {
          const out = Buffer.concat(body).toString();
          try {
            resolve(JSON.parse(out));
	  } catch(ignore) {
            resolve(null);
	  }
	})
      })
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

