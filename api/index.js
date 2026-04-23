// File: [api/index.js](api/index.js)
import app from '../backend/src/index.js';

export default function handler(req, res) {
  return app(req, res);
}