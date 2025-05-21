import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';

const MDX_DIRECTORY = path.join(process.cwd(), 'mdx');

async function getDirectoryContents(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const contents = await Promise.all(entries
      .filter(entry => entry.isDirectory())
      .map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        let coverImage = null;
        
        // Check for cover image (e.g., cover.jpg or cover.png) inside the directory
        const coverJpgPath = path.join(fullPath, 'cover.jpg');
        const coverPngPath = path.join(fullPath, 'cover.png');

        try {
          await fs.access(coverJpgPath);
          coverImage = '/mdx/' + path.relative(MDX_DIRECTORY, coverJpgPath).replace(/\\/g, '/');
        } catch {}

        if (!coverImage) {
          try {
            await fs.access(coverPngPath);
            coverImage = '/mdx/' + path.relative(MDX_DIRECTORY, coverPngPath).replace(/\\/g, '/');
          } catch {}
        }

        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: entry.name,
          coverImage: coverImage, // Add cover image path
        };
      }));
      // Sort directories alphabetically
      contents.sort((a, b) => a.name.localeCompare(b.name));
      return contents;

  } catch (error) {
    console.error('Error reading directory:', dirPath, error);
    return [];
  }
}

export default async function LearnPage() {
  const contents = await getDirectoryContents(MDX_DIRECTORY);

  return (
    // Added Tailwind classes for padding, background, and rounded corners
    <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">学习中心</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contents.map((item) => (
          <Link 
            href={`/learn/${encodeURIComponent(item.path)}`} 
            key={item.path} 
            // Added Tailwind classes for flex layout, border, shadow, rounded corners, and background
            className="block p-6 border rounded-lg shadow hover:shadow-md transition-shadow bg-blue-50 border-blue-200 flex flex-col items-center text-center space-y-4"
          >
            {/* Display cover image if available */}
            {item.coverImage && (
              <div className="relative w-full h-32 rounded-md overflow-hidden">
                <Image 
                  src={item.coverImage}
                  alt={`Cover image for ${item.name}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-700">{item.name}</h2>
            <p className="text-sm text-gray-500">(文件夹)</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 