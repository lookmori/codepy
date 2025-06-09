# Coze在线客服集成指南

本文档说明如何在CodePy项目中配置和使用Coze在线客服功能。

## 环境变量配置

在项目根目录创建`.env.local`文件（不要提交到版本控制系统），添加以下环境变量：

```
# Coze机器人ID（客户端使用）
NEXT_PUBLIC_KEFU_COZE_BOT_ID=您的机器人ID

# JWT认证相关配置（服务端使用，用于API获取token）
KEFU_COZE_CLIENT_ID_JWT=您的客户端ID
KEFU_COZE_PRIVATE_KEY_JWT=您的私钥（多行内容，需要正确转义）
KEFU_COZE_PUBLIC_KEY_ID_JWT=您的公钥ID
KEFU_COZE_API_BASE_JWT=https://api.coze.cn

# 备用token（当API调用失败时客户端使用）
NEXT_PUBLIC_KEFU_COZE_TOKEN=您的备用PAT令牌
```

## 私钥格式说明

`KEFU_COZE_PRIVATE_KEY_JWT`环境变量需要包含完整的RSA私钥，包括开头和结尾的标记行。在`.env.local`文件中，您可以这样设置多行内容：

```
KEFU_COZE_PRIVATE_KEY_JWT="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu
...（中间内容省略）...
-----END PRIVATE KEY-----"
```

## 获取Coze认证信息

1. 登录[Coze开发者平台](https://www.coze.cn)
2. 创建一个机器人或使用现有机器人
3. 获取机器人ID（bot_id）
4. 在开发者设置中创建OAuth应用，获取客户端ID
5. 生成RSA密钥对，并在平台中注册公钥
6. 记录公钥ID

## 组件使用方法

CustomerService组件已经集成到首页。如果您需要在其他页面使用，请按以下步骤操作：

1. 在页面文件中导入组件：
```javascript
import dynamic from 'next/dynamic';

// 使用动态导入确保客服组件只在客户端渲染
const CustomerService = dynamic(() => import('@/components/CustomerService'), {
  ssr: false,
});
```

2. 在页面组件中使用：
```javascript
function YourPage() {
  return (
    <div>
      {/* 您的页面内容 */}
      <CustomerService />
    </div>
  );
}
```

## API端点

系统提供了以下API端点用于Coze集成：

- `/api/coze/token` - 获取Coze访问令牌

这个API使用JWT认证方式从Coze平台获取访问令牌，客户端组件会自动调用此API。

## 故障排除

1. 如果客服组件无法加载，请检查浏览器控制台是否有错误信息
2. 确认所有环境变量已正确设置
3. 验证JWT认证信息是否有效
4. 检查网络请求是否正常

## 安全注意事项

- 不要将私钥提交到版本控制系统
- 定期轮换密钥和令牌
- 在生产环境中使用HTTPS
- 为API端点添加适当的速率限制

## 参考资源

- [Coze开发者文档](https://www.coze.cn/docs)
- [Next.js环境变量文档](https://nextjs.org/docs/basic-features/environment-variables) 