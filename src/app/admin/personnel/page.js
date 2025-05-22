"use client";
import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { fetchWithThrow } from '@/lib/fetchWithThrow';
import { Suspense } from 'react';
import PageLoading from '@/app/loading';

// Placeholder component for user list (will be implemented later)
function UserList({ role, userRole, page, limit, onPageChange, refreshKey, search }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithThrow(`/api/admin/users?role=${role}&page=${page}&limit=${limit}`);
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [role, page, limit, refreshKey]);

  // 本地搜索过滤
  const filteredUsers = users.filter(user => {
    if (!search || !search.trim()) return true;
    const keyword = search.trim().toLowerCase();
    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">用户名</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">邮箱</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">角色</th>
            {/* Add more headers if needed */}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
              {/* Add more data cells */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 mx-1 rounded-md"
              variant={page <= 1 ? 'secondary' : 'primary'}
              size="sm"
            >
              上一页
            </Button>
            {[...Array(totalPages).keys()].map(number => (
              <Button
                key={number + 1}
                onClick={() => onPageChange(number + 1)}
                className="px-4 py-2 mx-1 rounded-md"
                variant={page === number + 1 ? 'primary' : 'secondary'}
                size="sm"
              >
                {number + 1}
              </Button>
            ))}
            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              size="sm"
              variant={page >= totalPages ? "secondary" : "primary"}
              className="px-4 py-2 mx-1 rounded-md"
            >
              下一页
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}

function PersonnelPageContent() {
  // Assuming user data is available in localStorage from login/middleware
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('student');
  const [studentPage, setStudentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const limit = 10; // Items per page

  const [showAddModal, setShowAddModal] = useState(false);
  const [userRoleToAdd, setUserRoleToAdd] = useState('STUDENT'); // STUDENT or TEACHER
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const { addToast } = useToast();

  const [studentRefreshKey, setStudentRefreshKey] = useState(0);
  const [teacherRefreshKey, setTeacherRefreshKey] = useState(0);

  const [searchStudent, setSearchStudent] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');

  // Function to handle opening the modal
  const handleOpenAddModal = (role) => {
    console.log('Attempting to open add user modal for role:', role);
    setUserRoleToAdd(role);
    setAddFormData({ username: '', email: '', password: '' }); // Clear form
    setAddFormErrors({}); // Clear errors
    setShowAddModal(true);
  };

  // Function to handle closing the modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  // Handle form input change
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific error on input change
    if (addFormErrors[name]) {
      setAddFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddFormErrors({}); // Clear previous errors
    setIsAdding(true);

    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/;
    if (!addFormData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (!nameRegex.test(addFormData.username)) {
        errors.username = '用户名格式不正确 (2-20字符，中文、英文、数字、下划线)';
    }    
    if (!addFormData.email.trim()) {
      errors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(addFormData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!addFormData.password) {
      errors.password = '请输入密码';
    } else if (addFormData.password.length < 6) {
      errors.password = '密码长度至少为6个字符';
    }
    // Simple validation (more robust validation should be on backend)

    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      setIsAdding(false);
      return;
    }

    try {
      const data = await fetchWithThrow('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addFormData, role: userRoleToAdd }),
      });

      if (!data.ok) {
        // Handle backend validation errors or other errors
        if (data.validationErrors) {
          setAddFormErrors(data.validationErrors);
        } else {
          addToast({
            title: '添加失败',
            message: data.error || '创建用户失败',
            type: 'danger',
          });
        }
        throw new Error(data.error || '创建用户失败'); // Propagate error to catch block
      }

      addToast({
        title: '添加成功',
        message: `${userRoleToAdd === 'STUDENT' ? '学生' : '教师'} ${addFormData.username} 已成功添加！`,
        type: 'success',
      });
      handleCloseAddModal();
      // Refresh the user list after adding
      if (userRoleToAdd === 'STUDENT') {
        setStudentPage(1); // Go to first page to see the new user
        setStudentRefreshKey(k => k + 1); // 强制刷新
      } else {
        setTeacherPage(1); // Go to first page
        setTeacherRefreshKey(k => k + 1); // 强制刷新
      }
    } catch (err) {
      // Error already handled by addToast for non-validation errors
      console.error('创建用户错误:', err);
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    setCurrentUser(user);
    // Default tab based on role
    if (user?.role === 'TEACHER') {
      setActiveTab('student');
    }
  }, []);

  if (!currentUser) {
    // Or redirect to login/unauthorized page
    return <Error message="请登录或您没有权限访问此页面" />;
  }

  // Check if user has access to this page
  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
      return <Error message="您没有权限访问此页面" />;
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-300">人员管理</h1>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'student' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            onClick={() => setActiveTab('student')}
          >
            学生管理
          </button>
          {isAdmin && (
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'teacher' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
              onClick={() => setActiveTab('teacher')}
            >
              教师管理
            </button>
          )}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'student' && (
          <div>
            {(isAdmin || isTeacher) && (
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="搜索用户名或邮箱..."
                  value={searchStudent}
                  onChange={e => setSearchStudent(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64"
                  style={{ marginRight: '1rem' }}
                />
                <Button
                  onClick={() => handleOpenAddModal('STUDENT')}
                  variant="primary"
                  size="sm"
                >
                  添加学生
                </Button>
              </div>
            )}
            <UserList
              role="STUDENT"
              userRole={currentUser.role}
              page={studentPage}
              limit={limit}
              onPageChange={setStudentPage}
              refreshKey={studentRefreshKey}
              search={searchStudent}
            />
          </div>
        )}
        {activeTab === 'teacher' && isAdmin && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                value={searchTeacher}
                onChange={e => setSearchTeacher(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64"
                style={{ marginRight: '1rem' }}
              />
              <Button
                onClick={() => handleOpenAddModal('TEACHER')}
                variant="primary"
                size="sm"
              >
                添加教师
              </Button>
            </div>
            <UserList
              role="TEACHER"
              userRole={currentUser.role}
              page={teacherPage}
              limit={limit}
              onPageChange={setTeacherPage}
              refreshKey={teacherRefreshKey}
              search={searchTeacher}
            />
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={handleCloseAddModal} title={`添加${userRoleToAdd === 'STUDENT' ? '学生' : '教师'}`}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
            <input
              type="text"
              name="username"
              value={addFormData.username}
              onChange={handleAddInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${addFormErrors.username ? 'border-red-500' : ''}`}
              required
            />
            {addFormErrors.username && <p className="mt-1 text-sm text-red-500">{addFormErrors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
            <input
              type="email"
              name="email"
              value={addFormData.email}
              onChange={handleAddInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${addFormErrors.email ? 'border-red-500' : ''}`}
              required
            />
            {addFormErrors.email && <p className="mt-1 text-sm text-red-500">{addFormErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
            <input
              type="password"
              name="password"
              value={addFormData.password}
              onChange={handleAddInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${addFormErrors.password ? 'border-red-500' : ''}`}
              required
            />
            {addFormErrors.password && <p className="mt-1 text-sm text-red-500">{addFormErrors.password}</p>}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isAdding}
            >
              {isAdding ? '添加中...' : '确认添加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function PersonnelPage() {
  return (
    <Suspense fallback={<PageLoading />}> 
      <PersonnelPageContent />
    </Suspense>
  );
} 