
import app from './app.js';
import { config } from './config/env.js';

app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`📍 Environment: ${config.NODE_ENV}`);
});
 
 
