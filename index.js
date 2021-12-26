const http = require('http');
const https = require('https');
const Docker = require('dockerode');

const docker = new Docker({
    socketPath: '/var/run/docker.sock'
});

const server = http.createServer(async (req, res) => {
    const queryType = req.url.split('/')[1];
    const identifier = req.url.split('/')[2];
    let code = 200;
    let isWrongHttpMethod = false;
    if(req.method !== 'HEAD') {
        code = 400;
        isWrongHttpMethod = true;
    }
    if(!queryType || !identifier || isWrongHttpMethod) {
        code = 404;
    }
    switch(queryType) {
        case 'docker':
            if((process.env.DOCKER_BLACKLIST && process.env.DOCKER_BLACKLIST.split(',').indexOf(identifier) !== -1) 
            || (process.env.DOCKER_WHITELIST && process.env.DOCKER_WHITELIST.split(',').indexOf(identifier) === -1)){
                code = 401;
                break;
            }
            const container = docker.getContainer(`${identifier}`);
            await container.inspect()
                .then(c => {
                    code = c?.State?.Status == "running" ? 200 : 500;
                })
                .catch(e => {
                    code = e.statusCode;
                });
            console.log("code", code);
            break;
        case 'head':
            const endpoint = Buffer.from(identifier, 'base64').toString('utf-8');
            code = await checkUrlHealth(endpoint);
            break;
    }
    res.writeHead(code, {
        'Access-Control-Allow-Origin': `${process.env.CORS_ORIGIN || '*'}`,
        'Access-Control-Allow-Methods': 'HEAD',
    });
    res.end();
}).listen(process.env.PORT || 3000);

server.on('listening', () => {
    process.stdout.write(`Listening on ${server.address().port}\n`);
});

const checkUrlHealth = async endpoint => {
    return new Promise(resolve => {
        const hostname = endpoint.split('/')[2];
        if((process.env.HOSTNAME_BLACKLIST && process.env.HOSTNAME_BLACKLIST.split(',').indexOf(hostname) !== -1) 
        || (process.env.HOSTNAME_WHITELIST && process.env.HOSTNAME_WHITELIST.split(',').indexOf(hostname) === -1)){
            return resolve(401)
        }
        const protocol = `${endpoint.split(':')[0]}:`;
        const request = (protocol == 'https:' ? https.request : http.request);
        const port = endpoint.split(':')[2]?.split('/')[0];
        const path = `/${endpoint.split('/').splice(3).join('/')}`;
        const method = 'HEAD';

        const options = {
            protocol,
            hostname,
            port : parseInt(port ? port : (protocol == 'https:' ? 443 : 80)),
            path,
            method
        };

        const req = request(options, (res) => {
            resolve(res.statusCode);
        });

        req.on('error', (e) => {
            resolve(500);
        });
        req.end();
    })
}