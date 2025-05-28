import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quotes')({
  component: QuotesLayout,
})

function QuotesLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
} 