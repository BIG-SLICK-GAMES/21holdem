const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET;

  if (!target) return;

  app.use('/api', createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `/api${path}`,
  }));

  app.use('/v1', createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1${path}`,
  }));

  app.use('/socket.io', createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathRewrite: (path) => `/socket.io${path}`,
  }));
};
