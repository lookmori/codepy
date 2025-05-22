const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});
 
module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  // 你的其它 Next.js 配置项
}); 