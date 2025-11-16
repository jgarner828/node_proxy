import express from "express";
import httpProxy from "http-proxy";
import logger from "../site/logger.js";

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3003;
const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";



// Import response handlers
import { handleHtmlResponse, handleDefaultResponse, handleJsonResponse, handleStreamingResponse } from "./handlers/index.js";



// Middleware to log incoming requests. can also modify requests here with the req object. available properties include req.url, req.method, req.headers, req.body, etc.
app.use((req, res, next) => {
    logger.info(`Incoming Request Method and URL: ${req.method} ${req.url}`);

    //test changing the endpoint for /hello to /helloInterception
    if (req.url === '/hello') {
        logger.info(`Intercepting request to /hello, redirecting to /helloInterception`);
        req.url = '/helloInterception';
    }


    next();
});





// Listen for proxyRes event to log response body and headers
proxy.on('proxyRes', (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'] || '';
    

    // Route to appropriate handler based on content type
    if (contentType.includes('text/event-stream')) {
        handleStreamingResponse(proxyRes, req, res);
    } else if (contentType.includes('text/html')) {
        handleHtmlResponse(proxyRes, req, res);
    } else if (contentType.includes('application/json')) {
        handleJsonResponse(proxyRes, req, res);
    } else {
        handleDefaultResponse(proxyRes, req, res);
    }
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
const server = app.listen(PORT, () => {
    logger.info(`Proxy server is running on port ${PORT}, forwarding to ${TARGET_URL}`);
});



// Allow the server to handle upgrade requests for WebSockets
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, { target: TARGET_URL });
});