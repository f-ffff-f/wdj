import { fetcher } from "@/app/_lib/queryClient/fetcher"
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
          queryFn: async ({ queryKey }) => {
              const url = queryKey[0] as string // queryKey의 첫 번째 요소는 URL로 사용
              return fetcher(url)
          },
          retry: false, // 인증 관련 요청은 재시도 비활성화
      },
  },
})