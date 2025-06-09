import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('收到OAuth Token请求');
    const { code } = await request.json();
    
    if (!code) {
      console.error('OAuth Token请求缺少code参数');
      return NextResponse.json({ error: '缺少code参数' }, { status: 400 });
    }
    
    // 从URL获取state参数，用于区分不同的应用场景
    const url = new URL(request.url);
    const referer = request.headers.get('referer') || '';
    console.log('请求来源:', referer);
    const state = url.searchParams.get('state') || (referer.includes('/exam') ? 'exam' : 'practice');
    console.log('使用state:', state);
    
    // 根据state选择不同的配置
    let client_id, client_secret, redirect_uri;
    
    if (state === 'exam') {
      client_id = process.env.GEN_EXAM_COZE_CLIENT_ID || '90242169603687806132942397704438.app.coze';
      client_secret = process.env.GEN_EXAM_COZE_CLIENT_SECRET || process.env.COZE_CLIENT_SECRET;
      redirect_uri = process.env.GEN_EXAM_REDIRECT_URI || 'http://localhost:3000/exam';
      console.log('使用考试配置, redirect_uri:', redirect_uri);
    } else {
      client_id = process.env.COZE_CLIENT_ID || '90242169603687806132942397704438.app.coze';
      client_secret = process.env.COZE_CLIENT_SECRET;
      redirect_uri = process.env.COZE_REDIRECT_URI || 'https://www.code.lookmori.cn/practice';
      console.log('使用练习配置, redirect_uri:', redirect_uri);
    }
    
    if (!client_secret) {
      console.error('未配置COZE_CLIENT_SECRET');
      return NextResponse.json({ error: '未配置COZE_CLIENT_SECRET' }, { status: 500 });
    }

    console.log('开始请求Coze OAuth Token');
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
    console.log('Coze OAuth Token响应状态:', res.status);
    
    if (res.ok) {
      console.log('成功获取OAuth Token');
    } else {
      console.error('获取OAuth Token失败:', data);
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('获取Coze token失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 