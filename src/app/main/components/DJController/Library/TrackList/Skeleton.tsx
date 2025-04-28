'use client'

import React from 'react'
import { ArrowUpCircle } from 'lucide-react'
import { Button } from '@/lib/client/components/ui/button'
import { Card } from '@/lib/client/components/ui/card'

const Skeleton = () => {
    return (
        // 실제 Item과 동일한 flex 구조 사용
        <div className="flex animate-pulse">
            {/* 실제 Item의 Card와 유사한 스타일 적용 (padding, shadow 등) */}
            <Card className="w-full relative flex items-center justify-between p-4 pr-6 shadow-none bg-secondary dark:bg-inherit">
                {/* 왼쪽 버튼 스켈레톤 */}

                <Button className="bg-transparent">
                    <ArrowUpCircle className="text-transparent" />
                </Button>

                {/* 중앙 텍스트 영역 스켈레톤 */}
                <div className="w-[200px] md:w-[300px] space-y-2">
                    <div className="h-4 rounded w-3/4 mx-auto"></div> {/* 텍스트 라인 */}
                </div>

                {/* 오른쪽 버튼 스켈레톤 */}
                <Button className="bg-transparent">
                    <ArrowUpCircle className="text-transparent" />
                </Button>
            </Card>
        </div>
    )
}

export default Skeleton
