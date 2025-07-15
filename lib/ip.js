function getip(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  return ip;
}

export default getip;