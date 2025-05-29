import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "../components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
        <div className="text-center">
          <a href="/register" className="text-blue-500 hover:text-blue-700">
            还没有账号？立即注册
          </a>
        </div>
      </div>
    </div>
  );
} 