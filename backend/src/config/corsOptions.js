
import { config } from './env.js';

export const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [config.FRONTEND_URL, config.FRONTEND_URL_ALT];
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
