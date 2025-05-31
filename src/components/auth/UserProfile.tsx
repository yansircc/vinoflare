import { signOut, useSession } from "@/lib/auth";

export function UserProfile() {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="mx-auto max-w-md">
				<div className="rounded-lg border border-gray-200 p-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
						<svg
							className="h-8 w-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>User avatar</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</div>
					<h3 className="font-medium text-gray-900 text-lg">未登录</h3>
					<p className="mt-1 text-gray-500 text-sm">请先登录以查看个人资料</p>
				</div>
			</div>
		);
	}

	const handleSignOut = async () => {
		try {
			await signOut();
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="mx-auto max-w-md">
			{/* 头部 */}
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-light text-2xl text-gray-900">个人资料</h1>
				<button
					type="button"
					onClick={handleSignOut}
					className="rounded-full border border-gray-300 px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
				>
					登出
				</button>
			</div>

			{/* 用户信息卡片 */}
			<div className="rounded-lg border border-gray-200 p-6">
				<div className="space-y-6">
					{/* 头像和基本信息 */}
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 font-medium text-white text-xl">
							{session.user.image ? (
								<img
									src={session.user.image}
									alt="User avatar"
									className="h-16 w-16 rounded-full"
								/>
							) : (
								session.user.name?.charAt(0).toUpperCase()
							)}
						</div>
						<div className="flex-1">
							<h2 className="font-medium text-gray-900 text-lg">
								{session.user.name}
							</h2>
							<p className="text-gray-500 text-sm">{session.user.email}</p>
						</div>
					</div>

					{/* 状态信息 */}
					<div className="space-y-3">
						<div className="flex items-center justify-between border-gray-100 border-b pb-3">
							<span className="text-gray-700 text-sm">登录状态</span>
							<span className="text-gray-900 text-sm">已登录</span>
						</div>

						{session.user.emailVerified && (
							<div className="flex items-center justify-between border-gray-100 border-b pb-3">
								<span className="text-gray-700 text-sm">邮箱验证</span>
								<div className="flex items-center gap-1">
									<svg
										className="h-3 w-3 text-gray-600"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<title>Email verified icon</title>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="text-gray-900 text-sm">已验证</span>
								</div>
							</div>
						)}

						<div className="flex items-center justify-between">
							<span className="text-gray-700 text-sm">用户类型</span>
							<span className="text-gray-900 text-sm">普通用户</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
