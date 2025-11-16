import logger from "../logger.js";


// Handler for streaming responses (SSE, etc.)
export const handleStreamingResponse = (proxyRes, req, res) => {
    logger.info(`[proxyRes] Streaming response for: ${req.method} ${req.url}`);
    
    // Set headers immediately
    res.statusCode = proxyRes.statusCode;
    res.statusMessage = proxyRes.statusMessage;
    Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Pipe chunks through immediately as they arrive
    proxyRes.on('data', (chunk) => {
        logger.info(`[proxyRes stream] chunk length: ${chunk.length}`);
        logger.info(`[proxyRes stream] chunk: ${chunk.toString('utf8')}`);
        res.write(chunk);
    });
    
    proxyRes.on('end', () => {
        logger.info(`[proxyRes stream end] stream closed for: ${req.method} ${req.url}`);
        res.end();
    });
};