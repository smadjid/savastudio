const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware('/api',{
      target: process.env.API_HTTP_SERVER,
      changeOrigin: true,
    })
  );

  app.use('/socket.io',
    createProxyMiddleware('/socket.io', {
       target: process.env.API_HTTP_SERVER,
       changeOrigin: true,
       ws: false
     })
   );
};