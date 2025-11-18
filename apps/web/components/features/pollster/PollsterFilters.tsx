'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonGroup } from '@/components/ui/Button'

export function PollsterFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentOrder = searchParams.get('orderBy') || 'accuracy'

  const handleOrderChange = (orderBy: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('orderBy', orderBy)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold mb-1">Sort By</h3>
          <p className="text-sm text-muted-foreground">
            Order pollsters by different metrics
          </p>
        </div>

        <ButtonGroup>
          <Button
            variant={currentOrder === 'accuracy' ? 'primary' : 'default'}
            size="sm"
            onClick={() => handleOrderChange('accuracy')}
          >
            Accuracy
          </Button>
          <Button
            variant={currentOrder === 'grade' ? 'primary' : 'default'}
            size="sm"
            onClick={() => handleOrderChange('grade')}
          >
            Grade
          </Button>
          <Button
            variant={currentOrder === 'pollCount' ? 'primary' : 'default'}
            size="sm"
            onClick={() => handleOrderChange('pollCount')}
          >
            Poll Count
          </Button>
          <Button
            variant={currentOrder === 'name' ? 'primary' : 'default'}
            size="sm"
            onClick={() => handleOrderChange('name')}
          >
            Name
          </Button>
        </ButtonGroup>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="font-semibold">Methodology Grades:</span>
            <span className="ml-2 text-muted-foreground">
              A+ (Best) → F (Worst)
            </span>
          </div>
          <div>
            <span className="font-semibold">Accuracy:</span>
            <span className="ml-2 text-muted-foreground">
              Measured against actual election results
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
