const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
