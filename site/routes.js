import { Router } from "express";
const router = Router();
import logger from "./logger.js";



// Sample route
router.get('/', (req, res) => {

    logger.info('Root endpoint accessed');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.send(
        `<html>
            <head><title>Sample App</title></head>
            <body>
                <h1>Welcome to the Sample App</h1>
                <p>Use the /stream endpoint to receive server-sent events.</p>
                <button onclick="startStream()">Start Stream</button>
            </body>
        </html>`
    );
});


router.get('/helloInterception', (req, res) => {

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.send(
        `<html>
            <head><title>Hello Interception</title></head>
            <body>
                <h1>Hello Interception</h1>
                <p>This is a test page for interception.</p>
            </body>
        </html>`
    );
});



router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let count = 0;
    const intervalId = setInterval(() => {
        count += 1;
        res.write(`data: Message ${count}\n\n`);

        // For demonstration, stop after 10 messages
        if (count >= 10) {
            clearInterval(intervalId);
            res.end();
        }
    }, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
    });
});

export default router;