"use client";
import { useEffect, useState, Suspense } from "react";
import Loading from "@/components/Loading";
import Error from "@/components/Error";
import dynamic from "next/dynamic";
import { fetchWithThrow } from '@/lib/fetchWithThrow';
import PageLoading from '@/app/loading';

const LineChart = dynamic(() => import("@/components/LineChart"), { ssr: false });

const timeRanges = [
  { label: "一个月内", value: "month" },
  { label: "半年内", value: "halfyear" },
  { label: "一年内", value: "year" },
];

function ProfileContent() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("month");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWithThrow('/api/profile'),
      fetchWithThrow(`/api/profile/stats?range=${range}`),
    ])
      .then(([userData, statsData]) => {
        setUser(userData.user);
        setStats(statsData.stats);
        setError("");
      })
      .catch((e) => { throw e; })
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="w-[85%] mx-auto p-6 mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-300">个人信息</h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">个人资料</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">{user?.username}</div>
            <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
            <div className="text-gray-400 text-sm mt-1">注册时间：{user?.createdAt && new Date(user.createdAt).toLocaleDateString()}</div>
            <div className="text-gray-400 text-sm">角色：{user?.role}</div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">做题统计</h2>
          <div className="flex gap-2">
            {timeRanges.map((t) => (
              <button
                key={t.value}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${range === t.value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"}`}
                onClick={() => setRange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow">
          <LineChart stats={stats} />
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoading />}> 
      <ProfileContent />
    </Suspense>
  );
} 