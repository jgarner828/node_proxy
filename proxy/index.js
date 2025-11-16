import express from "express";
import httpProxy from "http-proxy";
import logger from "../site/logger.js";

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3003;
const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

// Middleware to log incoming requests
app.use((req, res, next) => {
// log out all of the headers
    // logger.info(`Incoming request: ${req.method} ${req.url}`);
    // logger.info(`Headers: ${JSON.stringify(req.headers)}`);
    // logger.info(`Body: ${JSON.stringify(req.body)}`);
    // logger.info('Content_type: ' + req.headers['content-type']);
    // logger.info('content-length: ' + req.headers['content-length']);
    // logger.info(`----------------------------------------`);

    //test changing the endpoint for /hello to /helloInterception
    if (req.url === '/hello') {
        logger.info(`Intercepting request to /hello, redirecting to /helloInterception`);
        req.url = '/helloInterception';
    }
    next();
});


// Listen for proxyRes event to log response body and headers
proxy.on('proxyRes', (proxyRes, req, res) => {
    // logger.info(`proxy.on line 25`);
    // logger.info(`Proxy response received for: ${req.method} ${req.url}`);
    // logger.info(`proxyRes headers: ${JSON.stringify(proxyRes.headers)}`);
    // logger.info(`proxyRes`, proxyRes);
    // logger.info(`proxyRes statusCode: ${proxyRes.statusCode}`);

    // logger.info(`req.method: ${req.method}`);
    // logger.info(`req.url: ${req.url}`);
    // logger.info(`req.headers: ${JSON.stringify(req.headers)}`);
    // logger.info(`req.body: ${JSON.stringify(req.body)}`);

    // logger.info(`response headers: ${JSON.stringify(proxyRes.headers)}`);
    // logger.info(`response statusCode: ${proxyRes.statusCode}`);
    // logger.info(`response statusMessage: ${proxyRes.statusMessage}`);
    // logger.info(`res.body: ${JSON.stringify(res.body)}`);

    let body = [];

    proxyRes.on('data', (chunk) => {
        logger.info(`[proxyRes data] chunk length: ${chunk.length}`);
        logger.info(`[proxyRes data] chunk: ${chunk.toString('utf8')}`);

        // find end of body and inject an alert message before it that says "Hello Proxy injection!"
        const html = chunk.toString('utf8');
        const bodyEndIndex = html.lastIndexOf('</body>');
        if (bodyEndIndex !== -1) {
            const injectedHtml = html.substring(0, bodyEndIndex) + '<script>alert("Hello Proxy injection!");</script>' + html.substring(bodyEndIndex);
            logger.info(`[proxyRes data] injectedHtml: ${injectedHtml}`);
            chunk = Buffer.from(injectedHtml, 'utf8'); 
        }   
        
        logger.info(`----------------------------------------`);
        body.push(chunk);
    });



    proxyRes.on('end', () => {
        logger.info(`[proxyRes end] response received for: ${req.method} ${req.url}`);

        const buffer = Buffer.concat(body); 
        logger.info(`[proxyRes end] buffer: ${buffer.toString('utf8')}`);

        // Set the headers and status code on the original response
        res.statusCode = proxyRes.statusCode;
        res.statusMessage = proxyRes.statusMessage;
        res.setHeader('content-length', buffer.length);
        res.setHeader('content-type', proxyRes.headers['content-type']);
        
        res.write(buffer);
        res.end();
        });


    });


// Proxy all requests to the target server
app.use((req, res) => {
    proxy.web(req, res, { target: TARGET_URL, selfHandleResponse: true }, (err) => {
        logger.info(`Proxying request to: ${TARGET_URL}${req.url}`);
        logger.error(`Proxy error: ${err.message}`);
        res.status(502).send("Bad Gateway");
    });
});



// Start the proxy server
app.listen(PORT, () => {
    logger.info(`Proxy server is running on port ${PORT}, forwarding to ${TARGET_URL}`);
});