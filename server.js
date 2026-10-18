// server.js
// TNEH CUSTOM SMS BD — Owner: TNEH OWNER

const express = require('express');

const API_NAME = 'TNEH CUSTOM SMS BD';
const OWNER = 'TNEH OWNER';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Root / Health Check
app.get('/', (req, res) => {
  res.json({
    status: true,
    api_name: API_NAME,
    owner: OWNER,
    message: 'Server is running successfully',
    endpoints: {
      info: '/api?info=1',
      // NEW ENDPOINT FORMAT
      register: '/api?num=<phone>&name=<name>&business=<business_name>',
    },
  });
});

// Main API
app.all('/api', async (req, res) => {
  const q = req.query || {};
  const body = req.body || {};

  const num = (q.num ?? body.num ?? '').toString().trim();
  
  // Support direct 'name' and 'business' variables
  let namePart = (q.name ?? body.name ?? '').toString().trim();
  let businessNamePart = (q.business ?? body.business ?? '').toString().trim();
  
  // Fallback to the old 'msg' splitting method if name/business are not provided
  let msg = (q.msg ?? body.msg ?? '').toString().trim();

  // Info endpoint
  if (q.info || body.info) {
    return res.status(200).json({
      status: true,
      api_name: API_NAME,
      owner: OWNER,
      version: '1.1.0',
      endpoints: {
        register_new: '/api?num=<phone>&name=<name>&business=<business_name>',
        register_old: '/api?num=<phone>&msg=<name+business>',
      },
    });
  }

  if (!num) {
    return res.status(200).json({
      status: false,
      api_name: API_NAME,
      owner: OWNER,
      error: 'Missing parameter: num is required',
    });
  }

  // If name or business is missing, use the old splitting logic from 'msg'
  if ((!namePart || !businessNamePart) && msg) {
    if (msg.length < 6) msg = msg.padEnd(6, ' ');
    const chars = Array.from(msg);
    const half = Math.ceil(chars.length / 2);
    namePart = namePart || chars.slice(0, half).join('').trim();
    businessNamePart = businessNamePart || chars.slice(half).join('').trim();
  }

  // Validate required fields
  if (!namePart || !businessNamePart) {
    return res.status(200).json({
      status: false,
      api_name: API_NAME,
      owner: OWNER,
      error: 'Missing parameters. Provide either (num + msg) OR (num + name + business)',
    });
  }

  // Force both parts to be between 3 and 50 characters
  const padAndSlice = (str) => {
    let s = str.trim();
    if (s.length < 3) s = s.padEnd(3, 'x');
    if (s.length > 50) s = s.substring(0, 50).trim();
    return s;
  };

  namePart = padAndSlice(namePart);
  businessNamePart = padAndSlice(businessNamePart);

  const payload = {
    name: namePart,
    phone_number: num,
    business_name: businessNamePart,
  };

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 12; V2027 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.8059.43 Mobile Safari/537.36',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'sec-ch-ua-platform': '"Android"',
    'sec-ch-ua':
      '"Android WebView";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    Origin: 'https://merchant.carrybee.com',
    'x-requested-with': 'mark.via.gp',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    Referer: 'https://merchant.carrybee.com/',
    'accept-language': 'en-US,en;q=0.9',
    priority: 'u=1, i',
  };

  try {
    const upstream = await fetch(
      'https://api-merchant.carrybee.com/api/v2/merchant/register',
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      }
    );

    const rawText = await upstream.text();

    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }

    if (parsed !== null) {
      return res.status(200).json({
        api_name: API_NAME,
        owner: OWNER,
        ...parsed,
      });
    }

    return res.status(200).json({
      status: true,
      api_name: API_NAME,
      owner: OWNER,
      raw_response: rawText,
    });
  } catch (err) {
    return res.status(200).json({
      status: false,
      api_name: API_NAME,
      owner: OWNER,
      error: 'Fetch Error: ' + (err && err.message ? err.message : String(err)),
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    api_name: API_NAME,
    owner: OWNER,
    error: 'Not found',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${API_NAME} (Owner: ${OWNER}) running on port ${PORT}`);
});
