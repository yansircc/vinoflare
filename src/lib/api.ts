// API 工具函数
export function getApiUrl(path: string): string {
  // 在服务器端渲染时，我们需要使用绝对 URL
  if (typeof window === 'undefined') {
    // 服务器端
    return `http://localhost:5174${path}`
  }
  // 客户端，使用相对路径
  return path
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request error for ${path}:`, error)
    throw error
  }
} 