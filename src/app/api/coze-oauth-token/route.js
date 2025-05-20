import { NextResponse } from 'next/server';

export async function POST(request) {
  const { code } = await request.json();
  const client_id = '90242169603687806132942397704438.app.coze';
  const client_secret = process.env.COZE_CLIENT_SECRET;
  const redirect_uri = 'http://localhost:3000/practice';

  if (!client_secret) {
    return NextResponse.json({ error: '未配置COZE_CLIENT_SECRET' }, { status: 500 });
  }

  const res = await fetch('https://api.coze.cn/api/permission/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${client_secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id,
      redirect_uri,
      code,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 