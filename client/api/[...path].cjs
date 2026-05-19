/**
 * Vercel serverless handler — runs the Express API on the same deployment as the frontend.
 * Login requests go to /api/auth/login instead of being rewritten to index.html.
 */
const serverless = require('serverless-http');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    const app = require('../../server/server');
    handler = serverless(app);
  }
  return handler(req, res);
};
