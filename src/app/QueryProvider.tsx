'use client'

// QueryClientProvider는 useContext를 사용하기 때문에 'use client'를 상단에 추가해야 합니다.
import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'

const makeQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // SSR에서는 기본적으로 쿼리의 staleTime을 0이 아닌 값으로 설정하여
                // 클라이언트에서 즉시 재요청하는 것을 방지합니다.
                staleTime: 60 * 1000,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
    if (isServer) {
        // 서버: 항상 새로운 쿼리 클라이언트를 생성합니다.
        return makeQueryClient()
    } else {
        // 브라우저: 이미 클라이언트가 없으면 새로운 쿼리 클라이언트를 생성합니다.
        // React가 초기 렌더링 중에 멈추는 경우, 새 클라이언트를 다시 만들지 않도록 합니다.
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    // NOTE: React가 초기 렌더링 중에 멈추는 경우, useState를 사용하여
    // 쿼리 클라이언트를 초기화하지 않는 것이 좋습니다. 이는 클라이언트가
    // 초기 렌더링에서 사라질 수 있기 때문입니다.
    const queryClient = getQueryClient()

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
