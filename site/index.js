import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes.js';
import logger from './logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// import routes
app.use('/', router);


// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});