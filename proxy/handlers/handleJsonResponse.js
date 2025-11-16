import logger from "../logger.js";


// Handler for JSON responses
export const handleJsonResponse = (proxyRes, req, res) => {
    logger.info(`[proxyRes] JSON response for: ${req.method} ${req.url}`);
    let body = [];

    proxyRes.on('data', (chunk) => {
        logger.info(`[proxyRes JSON] chunk length: ${chunk.length}`);
        body.push(chunk);
    });

    proxyRes.on('end', () => {
        const buffer = Buffer.concat(body);
        
        // Optionally modify JSON here
        // const json = JSON.parse(buffer.toString('utf8'));
        // json.proxied = true;
        // const modifiedBuffer = Buffer.from(JSON.stringify(json));
        
        logger.info(`[proxyRes JSON end] Total buffer size: ${buffer.length}`);

        res.statusCode = proxyRes.statusCode;
        res.statusMessage = proxyRes.statusMessage;
        res.setHeader('content-length', buffer.length);
        res.setHeader('content-type', proxyRes.headers['content-type']);
        
        res.write(buffer);
        res.end();
    });
};