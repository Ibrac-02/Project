// Load environment variables from .env so EXPO_PUBLIC_* are available via process.env
const dotenv = require('dotenv');
dotenv.config();

// Reuse existing app.json configuration
const { expo } = require('./app.json');

module.exports = ({ config }) => {
  return {
    ...expo,
  };
};
