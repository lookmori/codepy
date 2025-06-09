import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// 从环境变量获取配置（添加kefu前缀）
const KEFU_COZE_CLIENT_ID_JWT = process.env.KEFU_COZE_CLIENT_ID_JWT;
const KEFU_COZE_PRIVATE_KEY_JWT = process.env.KEFU_COZE_PRIVATE_KEY_JWT;
const KEFU_COZE_PUBLIC_KEY_ID_JWT = process.env.KEFU_COZE_PUBLIC_KEY_ID_JWT;
const KEFU_COZE_API_BASE_JWT = process.env.KEFU_COZE_API_BASE_JWT || 'https://api.coze.cn';

export async function GET() {
  try {
    // 验证环境变量是否存在
    if (!KEFU_COZE_CLIENT_ID_JWT) {
      return NextResponse.json({ error: '缺少 KEFU_COZE_CLIENT_ID_JWT 环境变量' }, { status: 500 });
    }
    
    if (!KEFU_COZE_PRIVATE_KEY_JWT) {
      return NextResponse.json({ error: '缺少 KEFU_COZE_PRIVATE_KEY_JWT 环境变量' }, { status: 500 });
    }
    
    if (!KEFU_COZE_PUBLIC_KEY_ID_JWT) {
      return NextResponse.json({ error: '缺少 KEFU_COZE_PUBLIC_KEY_ID_JWT 环境变量' }, { status: 500 });
    }
    
    // 1. 创建JWT
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: KEFU_COZE_CLIENT_ID_JWT,
      aud: 'api.coze.cn',
      iat: now,
      exp: now + 300, // 5分钟有效期
      jti: uuidv4(),
    };

    // 使用私钥签名JWT
    const cozeJwt = jwt.sign(payload, KEFU_COZE_PRIVATE_KEY_JWT, {
      algorithm: 'RS256',
      keyid: KEFU_COZE_PUBLIC_KEY_ID_JWT,
    });

    // 2. 使用JWT换取access_token
    const tokenResp = await fetch(`${KEFU_COZE_API_BASE_JWT}/api/permission/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cozeJwt}`,
      },
      body: JSON.stringify({
        duration_seconds: 86400, // 24小时有效期
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      }),
    });

    const tokenData = await tokenResp.json();

    // 3. 验证响应
    if (!tokenData.access_token) {
      console.error('Coze token获取失败:', tokenData);
      return NextResponse.json({ error: 'Coze token获取失败', detail: tokenData }, { status: 500 });
    }

    // 4. 返回token信息，但不包含敏感数据
    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('获取Coze Token时发生错误:', error);
    return NextResponse.json({ 
      error: '获取Coze Token时发生错误', 
      message: error.message 
    }, { status: 500 });
  }
} 