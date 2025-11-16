import logger from "../logger.js";

// Default handler for other content types
export const handleDefaultResponse = (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'] || 'unknown';
    logger.info(`[proxyRes] Default handler for: ${contentType}`);
    let body = [];

    proxyRes.on('data', (chunk) => {
        logger.info(`[proxyRes default] chunk length: ${chunk.length}`);
        body.push(chunk);
    });

    proxyRes.on('end', () => {
        const buffer = Buffer.concat(body);
        logger.info(`[proxyRes default end] Total buffer size: ${buffer.length}`);

        res.statusCode = proxyRes.statusCode;
        res.statusMessage = proxyRes.statusMessage;
        res.setHeader('content-length', buffer.length);
        res.setHeader('content-type', proxyRes.headers['content-type']);
        
        res.write(buffer);
        res.end();
    });
};