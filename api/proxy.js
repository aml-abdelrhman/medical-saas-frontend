export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ده الرابط الحقيقي بتاعك على الاستضافة
  const targetUrl = `https://medical-center-saas.rf.gd/api${req.url.replace('/api/proxy', '')}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      ...(['POST', 'PUT', 'PATCH'].includes(req.method) ? { body: JSON.stringify(req.body) } : {})
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
}