import React, { useState } from 'react';
import { FaReply } from 'react-icons/fa'; // Assuming react-icons is installed

function UserAvatar({ user }) {
  const initial = (user.username || user.name || ' ')[0].toUpperCase();
  const bgColor = `bg-blue-500`; // Simple consistent color for now, can be made dynamic later
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${bgColor} flex-shrink-0`}>
      {initial}
    </div>
  );
}

function UserBadge({ user }) {
  let badge = null;
  if (user.role === 'TEACHER') badge = <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-medium">教师</span>;
  if (user.role === 'ADMIN') badge = <span className="ml-2 px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-medium">管理员</span>;
  return <span className="font-semibold text-gray-800 dark:text-gray-100">{user.username || user.name}{badge}</span>;
}

function CommentItem({ comment, onReply, currentUser, renderContent }) {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start mb-3">
        <UserAvatar user={comment.user} />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserBadge user={comment.user} />
              <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            {onReply && (
              <button className="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium" onClick={() => onReply(comment)}>
                <FaReply className="mr-1" />回复
              </button>
            )}
          </div>
          <div className="prose prose-sm sm:prose-base prose-blue dark:prose-invert max-w-none mt-2 text-gray-700 dark:text-gray-300">
            {renderContent ? renderContent(comment.content) : comment.content}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 border-l-2 border-blue-300 dark:border-blue-600 pl-4 pt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} renderContent={renderContent} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ questionId, currentUser, comments = [], onSubmit, onReply, loading, renderContent, readOnly = false }) {
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({
      questionId,
      user: currentUser, // Assuming currentUser is passed and has id, username/name, and role
      content,
      replyTo: replyTo?.id || null,
    });
    setContent('');
    setReplyTo(null);
  };

  // Function to handle reply click, scroll to form, and pre-fill with quote
  const handleReplyClick = (comment) => {
    if (readOnly) return; // Do nothing if readOnly
    setReplyTo(comment);
    setContent('');

    // Scroll to the comment form
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: 'smooth' });
    }
    if (onReply) onReply(comment); // Call original onReply if provided
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">评论区</h2>

      {/* Comment Form */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md" id="comment-form">
          {replyTo && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 rounded text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
              回复给 <UserBadge user={replyTo.user} />
              <button type="button" className="ml-4 text-xs text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setReplyTo(null)}>取消</button>
            </div>
          )}
          <textarea
            className="w-full min-h-[120px] p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="支持 Markdown 语法：**粗体**, *斜体*, `行内代码`, ```python\n代码块\n```, > 引用..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!content.trim() || loading}
            >
              {loading ? '发布中...' : (replyTo ? '回复' : '发表评论')}
            </button>
          </div>
        </form>
      )}

      {/* Comment List */}
      <div>
        {loading && <div className="text-center text-gray-500 dark:text-gray-400">评论加载中...</div>}
        {!loading && comments.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400">暂无评论，快来抢沙发吧！</div>}
        {!loading && comments.length > 0 && comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={currentUser && !readOnly ? handleReplyClick : undefined} // Only enable reply if user is logged in and not readOnly
            currentUser={currentUser}
            renderContent={renderContent}
          />
        ))}
      </div>
    </div>
  );
} 