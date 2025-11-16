import logger from "../logger.js";

// Handler for HTML responses (with injection capability)
export const handleHtmlResponse = (proxyRes, req, res) => {
    logger.info(`[proxyRes] HTML response for: ${req.method} ${req.url}`);
    let body = [];

    proxyRes.on('data', (chunk) => {
        logger.info(`[proxyRes HTML] chunk length: ${chunk.length}`);
        
        let html = chunk.toString('utf8');
        logger.info(`[proxyRes HTML] chunk content : ${html}`);

        
        // find h1 and change value
        const h1Index = html.indexOf('<h1>');
        const h1EndIndex = html.indexOf('</h1>');
        if (h1Index !== -1 && h1EndIndex !== -1) {
            const modifiedH1 = '<h1>Modified by Proxy Handler</h1>';
            html = html.substring(0, h1Index) + modifiedH1 + html.substring(h1EndIndex + 5);
            logger.info(`[proxyRes HTML] Modified h1 tag`);
        }

        const bodyEndIndex = html.lastIndexOf('</body>');
        
        if (bodyEndIndex !== -1) {
            html = html.substring(0, bodyEndIndex) + 
                '<script>alert("Hello Proxy injection!");</script>' + 
                html.substring(bodyEndIndex);
            logger.info(`[proxyRes HTML] Injected script into HTML`);
        }
        
        chunk = Buffer.from(html, 'utf8');
        body.push(chunk);
    });

    proxyRes.on('end', () => {
        const buffer = Buffer.concat(body);
        logger.info(`[proxyRes HTML end] Total buffer size: ${buffer.length}`);

        res.statusCode = proxyRes.statusCode;
        res.statusMessage = proxyRes.statusMessage;
        res.setHeader('content-length', buffer.length);
        res.setHeader('content-type', proxyRes.headers['content-type']);
        
        res.write(buffer);
        res.end();
    });
};