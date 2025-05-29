import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "../components/auth/UserProfile";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">个人资料</h1>
      <UserProfile />
    </div>
  );
} 