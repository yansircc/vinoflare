import { apiHelpers, useSession } from "../../lib/api-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>加载中...</div>;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await apiHelpers.handleSignOut();
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4 rounded-lg bg-gray-100 p-4">
      <div className="flex-grow">
        <p className="font-medium">欢迎, {session.user.name}</p>
        <p className="text-gray-600 text-sm">{session.user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        登出
      </button>
    </div>
  );
} 