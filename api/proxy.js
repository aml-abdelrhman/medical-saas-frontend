export default async function handler(req, res) {
  // السماح بجميع الـ CORS والـ Methods لمنع أي حظر من المتصفح
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // الرد الفوري على طلبات الـ OPTIONS (Preflight) لمنع أخطاء 405
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // بناء رابط الوجهة الحقيقي على الاستضافة
  const targetUrl = `https://medical-center-saas.rf.gd/api${req.url.replace('/api/proxy', '')}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
    };

    // تمرير الـ Body في حالة طلبات الـ POST أو PUT أو PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // محاولة قراءة الاستجابة كـ JSON، ولو حصل خطأ في التنسيق يتم التعامل معه
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ [Proxy JSON Parse Error]: استجابة الخادم ليست JSON صالح:', responseText);
      return res.status(500).json({ 
        error: 'Invalid JSON response from backend server', 
        rawResponse: responseText 
      });
    }

    // إرجاع الاستجابة بنفس الـ Status قادمة من السيرفر الأصلي
    return res.status(response.status).json(data);

  } catch (error) {
    // طباعة تفاصيل المشكلة كامضة في كونسول الـ Vercel Serverless Function للتشخيص الدقيق
    console.error('❌ [Proxy Fatal Error]: فشل الاتصال بالخادم الرئيسي:', {
      message: error.message,
      stack: error.stack,
      targetUrl
    });

    return res.status(500).json({ 
      error: 'Proxy connection failed', 
      details: error.message,
      target: targetUrl 
    });
  }
}