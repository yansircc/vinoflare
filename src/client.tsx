import { RouterProvider, createRouter } from '@tanstack/react-router'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    React.createElement(
      StrictMode,
      null,
      React.createElement(RouterProvider, { router })
    )
  )
} 