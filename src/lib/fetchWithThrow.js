export async function fetchWithThrow(url, options) {
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('服务器响应格式错误');
  }
  if (!res.ok) {
    throw new Error(data?.error || '请求失败');
  }
  return data;
} 