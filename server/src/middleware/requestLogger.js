function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const s = res.statusCode;
    const c = s >= 500 ? '\x1b[31m' : s >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${c}${req.method}\x1b[0m ${req.path} -> ${s} (${Date.now() - start}ms)`);
  });
  next();
}
module.exports = {requestLogger};