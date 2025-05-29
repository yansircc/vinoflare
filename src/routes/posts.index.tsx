import { createFileRoute } from '@tanstack/react-router'
import { useCreatePost, useLatestPost } from '../lib/posts-api'

export const Route = createFileRoute('/posts/')({
  component: LatestPost,
})

const CreatePostForm = () => {
  const { mutate: createPost } = useCreatePost()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    createPost({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    })
  }

  return <form onSubmit={handleSubmit} className="flex flex-col gap-2">
    <input type="text" name="title" placeholder="Title" className="rounded-md border border-gray-300 p-2" required />
    <input type="text" name="content" placeholder="Content" className="rounded-md border border-gray-300 p-2" required />
    <button type="submit" className="rounded-md bg-blue-500 p-2 text-white">Create</button>
  </form>
}

export function LatestPost() {
  const { data, isLoading, error } = useLatestPost()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div className="mx-auto flex max-w-4xl flex-col gap-4">
    <div className="font-bold text-2xl">{data?.[0]?.title}</div>
    <div className="text-gray-500 text-sm">{data?.[0]?.content}</div>
    <CreatePostForm />
  </div>
}