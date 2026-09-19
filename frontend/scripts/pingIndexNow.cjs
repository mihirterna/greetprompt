// Script to ping IndexNow & Microsoft Bing directly from CLI
const https = require('https');

const data = JSON.stringify({
  host: 'greetprompt.com',
  key: '8e2f9d6b4a1c5e3f7a9b0c2d4e6f8a1b',
  keyLocation: 'https://greetprompt.com/8e2f9d6b4a1c5e3f7a9b0c2d4e6f8a1b.txt',
  urlList: [
    'https://greetprompt.com/',
    'https://greetprompt.com/llms.txt',
    'https://greetprompt.com/llms-full.txt',
    'https://greetprompt.com/sitemap.xml'
  ]
});

function postIndexNow(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      console.log('[IndexNow] ' + hostname + ' responded with status: ' + res.statusCode);
      resolve(res.statusCode);
    });

    req.on('error', (e) => {
      console.error('[IndexNow Error] ' + hostname + ': ' + e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('📡 Submitting GreetPrompt URLs to AI & Search Engine Indexers...');
  await postIndexNow('api.indexnow.org');
  await postIndexNow('www.bing.com');
  console.log('✅ Done! Bing and AI search crawlers notified.');
}

main();
