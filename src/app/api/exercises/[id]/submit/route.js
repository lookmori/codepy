import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// COZE 相关环境变量
const COZE_CLIENT_ID_JWT = process.env.COZE_CLIENT_ID_JWT;
const COZE_PRIVATE_KEY_JWT = process.env.COZE_PRIVATE_KEY_JWT;
const COZE_PUBLIC_KEY_ID_JWT = process.env.COZE_PUBLIC_KEY_ID_JWT;
const COZE_API_BASE_JWT = process.env.COZE_API_BASE_JWT || 'https://api.coze.cn';
const COZE_WORKFLOW_ID_JWT = process.env.COZE_WORKFLOW_ID_JWT;

function getUserFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const tokens = [...cookie.matchAll(/token=([^;]+)/g)].map(m => m[1]);
  const jwtToken = tokens.length ? tokens.reduce((a, b) => (a.length > b.length ? a : b)) : null;
  if (!jwtToken) return null;
  try {
    return jwt.verify(jwtToken, process.env.JWT_SECRET || 'your-secret');
  } catch {
    return null;
  }
}

export async function POST(request, context) {
  const { id } = await context.params;
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  try {
    const { code } = await request.json();
    // 记录答题（根据判题结果设定状态）
    let upsertStatus = '已提交';
    let judgeResult = {};
    // 先执行判题
    // 获取题目描述
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    const problemDescription = exercise?.problem_description || '';
    // 1. 生成 Coze JWT
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: COZE_CLIENT_ID_JWT,
      aud: 'api.coze.cn',
      iat: now,
      exp: now + 300,
      jti: uuidv4(),
    };
    // 从环境变量读取私钥内容
    const privateKey = COZE_PRIVATE_KEY_JWT;

    if (!privateKey) {
      return NextResponse.json({ error: '缺少 COZE_PRIVATE_KEY_JWT 环境变量' }, { status: 500 });
    }

    const cozeJwt = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      keyid: COZE_PUBLIC_KEY_ID_JWT,
    });
    // 2. 换取 access_token
    const tokenResp = await fetch(`${COZE_API_BASE_JWT}/api/permission/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cozeJwt}`,
      },
      body: JSON.stringify({
        duration_seconds: 86399,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) {
      return NextResponse.json({ error: 'Coze token 获取失败', detail: tokenData }, { status: 500 });
    }
    // 3. 执行 Coze 工作流
    const wfResp = await fetch(`${COZE_API_BASE_JWT}/v1/workflow/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters: {
          ques_desc: problemDescription,
          ques_ans: code,
        },
        workflow_id: COZE_WORKFLOW_ID_JWT,
      }),
    });
    const wfData = await wfResp.json();
    try {
      judgeResult = typeof wfData.data === 'string' ? JSON.parse(wfData.data) : wfData.data;
    } catch (e) {
      judgeResult = { code_error: '判题结果解析失败', code_status: false };
    }
    if (judgeResult.code_status === true) {
      upsertStatus = '已通过';
    } else if (judgeResult.code_status === false) {
      upsertStatus = '错误';
    }
    await prisma.studentExerciseStatus.upsert({
      where: { user_id_exercise_id: { user_id: user.id, exercise_id: id } },
      update: { status: upsertStatus, last_code: code, submit_time: new Date(), answer: code },
      create: { user_id: user.id, exercise_id: id, status: upsertStatus, last_code: code, submit_time: new Date(), answer: code },
    });
    // 返回结构化信息给前端
    return NextResponse.json({
      code_error: judgeResult.code_error,
      code_status: judgeResult.code_status,
      msg: wfData.msg,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 