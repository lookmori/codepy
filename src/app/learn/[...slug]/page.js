import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote-client/rsc';

const MDX_BASE_DIRECTORY = path.join(process.cwd(), 'mdx');
const ITEMS_PER_PAGE = 10; // Define how many items per page

async function getDirectoryContents(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const contents = await Promise.all(entries
      .filter(entry => entry.isDirectory() || (entry.isFile() && entry.name.endsWith('.mdx')))
      .map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        // For directories, check for a cover image
        let coverImage = null;
        if (entry.isDirectory()) {
          const coverJpgPath = path.join(fullPath, 'cover.jpg');
          const coverPngPath = path.join(fullPath, 'cover.png');
          try {
            await fs.access(coverJpgPath);
            coverImage = '/mdx/' + path.relative(MDX_BASE_DIRECTORY, coverJpgPath).replace(/\\/g, '/');
          } catch {}
          if (!coverImage) {
            try {
              await fs.access(coverPngPath);
              coverImage = '/mdx/' + path.relative(MDX_BASE_DIRECTORY, coverPngPath).replace(/\\/g, '/');
            } catch {}
          }
        }

        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          relativePath: path.relative(MDX_BASE_DIRECTORY, fullPath),
          coverImage: coverImage, // Add cover image path
        };
      }));
      // Sort directories first, then files, alphabetically
      contents.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      return contents;

  } catch (error) {
    console.error('Error reading directory:', dirPath, error);
    return null; // Indicate directory not found or error
  }
}

async function getMdxData(filePath) {
  try {
    const source = await fs.readFile(filePath, 'utf-8');
    return source;
  } catch (error) {
    console.error('Error reading MDX file:', filePath, error);
    return null;
  }
}

export default async function CollectionPage({ params, searchParams }) {
  const { slug } = await params;
  // Get current page from search params, default to 1
  const searchParamsObj = await searchParams; // Await searchParams
  const currentPage = parseInt(searchParamsObj.page || '1', 10);
  
  const currentPathSegments = slug ? slug.map(segment => decodeURIComponent(segment)) : [];
  const currentAbsolutePath = path.join(MDX_BASE_DIRECTORY, ...currentPathSegments);

  let isDirectory = false;
  let isFile = false;

  try {
    const stats = await fs.stat(currentAbsolutePath);
    isDirectory = stats.isDirectory();
    isFile = stats.isFile() && currentAbsolutePath.endsWith('.mdx');
  } catch (error) {
    // Path does not exist
    notFound();
  }

  if (isDirectory) {
    const allContents = await getDirectoryContents(currentAbsolutePath);

    if (allContents === null) {
        // Error reading directory, maybe permissions or other issue
        notFound(); // Or render an error message
    }

    // Calculate pagination values
    const totalItems = allContents.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    // Ensure current page is within bounds
    const page = Math.max(1, Math.min(currentPage, totalPages));
    
    // Get items for the current page
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedContents = allContents.slice(startIndex, endIndex);

    // Construct parent directory URL for the back button
    const parentPathSegments = currentPathSegments.slice(0, -1);
    const parentUrl = parentPathSegments.length === 0 ? '/learn' : '/learn/' + parentPathSegments.map(encodeURIComponent).join('/');

    return (
      <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg">
        {/* Back button */}
        {currentPathSegments.length > 0 && (
          <Link href={parentUrl} className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200">
            &larr; 返回上一级
          </Link>
        )}

        <h1 className="text-3xl font-bold mb-6 text-gray-800">{currentPathSegments.length > 0 ? currentPathSegments[currentPathSegments.length - 1] : '学习中心'}</h1>
        
        {paginatedContents.length === 0 && allContents.length > 0 ? (
             // Handle case where current page has no items (e.g., beyond last page)
            <p>当前页没有内容，请返回<Link href={{ pathname: `/learn/${slug?.map(encodeURIComponent).join('/') || ''}`, query: { page: 1 } }} className="text-blue-600 hover:underline">第一页</Link>。</p>
        ) : paginatedContents.length === 0 && allContents.length === 0 ? (
             <p>此文件夹为空或不包含MDX文件。</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedContents.map((item) => {
                // Construct the full URL path, resetting page to 1 or removing page param
                const itemUrlPath = '/learn/' + item.relativePath.split(path.sep).map(encodeURIComponent).join('/');
                return (
                  <Link 
                    href={itemUrlPath}
                    key={item.relativePath}
                    className={`block p-6 border rounded-lg shadow hover:shadow-md transition-shadow ${item.isDirectory ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} flex items-center space-x-3`}
                  >
                    {/* Use cover image for directories, simple icon for files */}
                    {item.isDirectory && item.coverImage ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.coverImage}
                          alt={`Cover image for ${item.name}`}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : item.isDirectory ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                       </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h4c0 0 0 0 0 0l1-1 1-3m0-3V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0l.5-1m4.5-1v2m0-2h-2m0 0l-1 1m3-1l.5 1m-.5-1h2m0 0l.5 1M12 14v2m0-2h2m0 0l.5 1M10 9h.01M7 9h.01" />
                      </svg>
                    )}
                    <h2 className="text-xl font-semibold text-gray-700 flex-grow text-left">{item.name} {item.isDirectory ? '(文件夹)' : '(文件)'}</h2>
                  </Link>
                );
              })}
            </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && ( // Only show pagination if there is more than one page
          <div className="flex justify-center mt-8 space-x-2">
            {/* Previous Page Button */}
            <Link 
              href={{ pathname: `/learn/${slug?.map(encodeURIComponent).join('/') || ''}`, query: { page: page - 1 } }} 
              className={`px-4 py-2 border rounded-lg ${page <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              上一页
            </Link>

            {/* Page Numbers (Simple) */}
            {/* You could add more sophisticated page number display here */}
            <span className="px-4 py-2">页码 {page} / {totalPages}</span>

            {/* Next Page Button */}
            <Link 
               href={{ pathname: `/learn/${slug?.map(encodeURIComponent).join('/') || ''}`, query: { page: page + 1 } }} 
              className={`px-4 py-2 border rounded-lg ${page >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
            >
              下一页
            </Link>
          </div>
        )}

      </div>
    );

  } else if (isFile) {
    const mdxSource = await getMdxData(currentAbsolutePath);

    if (mdxSource === null) {
        notFound();
    }

     // Construct parent directory URL for the back button (for file view)
    const parentPathSegments = currentPathSegments.slice(0, -1);
    const parentUrl = parentPathSegments.length === 0 ? '/learn' : '/learn/' + parentPathSegments.map(encodeURIComponent).join('/');

    return (
      <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg">
         {/* Back button for file view */}
        <Link href={parentUrl} className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200">
            &larr; 返回上一级
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">{currentPathSegments[currentPathSegments.length - 1].replace('.mdx', '')}</h1>
        <div className="prose max-w-none mt-8">
          <MDXRemote source={mdxSource} 
            options={{
              parseFrontmatter: true,
              // Add remark and rehype plugins here if needed
            }}
           />
        </div>
      </div>
    );

  } else {
    // Path exists but is neither a directory nor an MDX file
    notFound();
  }
} 