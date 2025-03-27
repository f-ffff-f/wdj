'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface QueryProviderProps {
    children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
    // 컴포넌트 리렌더링 시에도 동일한 QueryClient 인스턴스를 유지
    const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }))

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
