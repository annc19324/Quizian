const dotenv = require('dotenv');
const path = require('path');
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });
if (result.error) {
    console.log('Error loading .env:', result.error);
}
console.log('DATABASE_URL:', process.env.DATABASE_URL);
