"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import Button from '@/components/Button';
import { fetchWithThrow } from '@/lib/fetchWithThrow';
import { Suspense } from 'react';
import PageLoading from '@/app/loading';
import Modal from '@/components/Modal';

function StudentExerciseHistoryContent() {
  const params = useParams();
  const studentId = params.studentId;
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Items per page

  // State for code/answer modal
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalContent, setCodeModalContent] = useState('');
  const [codeModalTitle, setCodeModalTitle] = useState('');

  // Function to show the code modal
  const handleShowCode = (title, content) => {
    setCodeModalTitle(title);
    setCodeModalContent(content);
    setShowCodeModal(true);
  };

  // Function to close the code modal
  const handleCloseCodeModal = () => {
    setShowCodeModal(false);
    setCodeModalTitle('');
    setCodeModalContent('');
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch student details (optional, but good to display student name)
        const studentData = await fetchWithThrow(`/api/admin/users/${studentId}`);
        setStudent(studentData.user);

        // Fetch exercise history with pagination
        const exerciseData = await fetchWithThrow(`/api/admin/users/${studentId}/exercises?page=${currentPage}&limit=${limit}`);
        setExercises(exerciseData.exercises);
        setTotalPages(exerciseData.totalPages);

      } catch (err) {
        console.error('Error fetching student data or exercises:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();

  }, [studentId, currentPage, limit]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!student) return <Error message="Student not found" />;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg min-h-[60vh]">
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="secondary" size="sm">
          &larr; 返回上一级
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-300">{student.username} 的做题记录</h1>

      {exercises.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">该学生还没有做题记录。</p>
      ) : (
        <div>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">题目</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">状态</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">提交时间</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">答案</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">最后提交代码</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {exercises.map(exerciseRecord => (
                <tr key={exerciseRecord.exercise_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{exerciseRecord.exerciseTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exerciseRecord.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(exerciseRecord.submit_time).toLocaleString()}</td>
                  {/* Display Answer in modal on click */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      onClick={() => handleShowCode(`${exerciseRecord.exerciseTitle} - 答案`, exerciseRecord.answer)}>
                    {exerciseRecord.answer ? '查看答案' : '无答案'}
                  </td>
                  {/* Display Last Code in modal on click */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      onClick={() => handleShowCode(`${exerciseRecord.exerciseTitle} - 最后提交代码`, exerciseRecord.last_code || '无提交代码')}>
                    {exerciseRecord.last_code ? '查看代码' : '无提交代码'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 mx-1 rounded-md"
                  variant={currentPage <= 1 ? 'secondary' : 'primary'}
                  size="sm"
                >
                  上一页
                </Button>
                {[...Array(totalPages).keys()].map(number => (
                  <Button
                    key={number + 1}
                    onClick={() => setCurrentPage(number + 1)}
                    className="px-4 py-2 mx-1 rounded-md"
                    variant={currentPage === number + 1 ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {number + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  size="sm"
                  variant={currentPage >= totalPages ? "secondary" : "primary"}
                  className="px-4 py-2 mx-1 rounded-md"
                >
                  下一页
                </Button>
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Code Display Modal */}
      <Modal isOpen={showCodeModal} onClose={handleCloseCodeModal} title={codeModalTitle}>
        <div className="overflow-auto max-h-96">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
            {codeModalContent}
          </pre>
        </div>
      </Modal>
    </div>
  );
}

export default function StudentExerciseHistoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <StudentExerciseHistoryContent />
    </Suspense>
  );
} 