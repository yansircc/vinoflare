import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { apiHelpers, useSession } from "../lib/api-client";

export const Route = createFileRoute("/test-auth")({
  component: TestAuthPage,
});

function TestAuthPage() {
  const { data: session, isPending } = useSession();
  const [testResult, setTestResult] = useState<string>("");

  const testAuth = async () => {
    try {
      const isAuth = await apiHelpers.isAuthenticated();
      setTestResult(`认证状态: ${isAuth ? "已登录" : "未登录"}`);
    } catch (error) {
      setTestResult(`测试失败: ${error}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">认证系统测试</h1>
      
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="mb-4 font-semibold text-xl">会话状态</h2>
          {isPending ? (
            <p>加载中...</p>
          ) : session ? (
            <div>
              <p><strong>用户 ID:</strong> {session.user.id}</p>
              <p><strong>姓名:</strong> {session.user.name}</p>
              <p><strong>邮箱:</strong> {session.user.email}</p>
              <p><strong>已验证邮箱:</strong> {session.user.emailVerified ? "是" : "否"}</p>
            </div>
          ) : (
            <p>未登录</p>
          )}
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="mb-4 font-semibold text-xl">认证测试</h2>
          <button
            type="button"
            onClick={testAuth}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            测试认证状态
          </button>
          {testResult && (
            <p className="mt-2 text-gray-600 text-sm">{testResult}</p>
          )}
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="mb-4 font-semibold text-xl">快速操作</h2>
          <div className="space-x-4">
            <a href="/login" className="inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
              Discord 登录
            </a>
            {session && (
              <button
                type="button"
                onClick={() => apiHelpers.handleSignOut()}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                登出
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 