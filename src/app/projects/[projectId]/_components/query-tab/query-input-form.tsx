import { Button } from '@/components/ui/button'
import type { ChangeEvent, KeyboardEvent, FormEvent } from 'react'

interface QueryInputFormProps {
  queryInput: string
  isSubmitting: boolean
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent) => void
}

export default function QueryInputForm({
  queryInput,
  isSubmitting,
  onChange,
  onKeyDown,
  onSubmit,
}: QueryInputFormProps) {
  return (
    <form
      className="w-full max-w-xl flex flex-col gap-4 mb-24"
      onSubmit={onSubmit}
    >
      <label htmlFor="research-query" className="text-left font-medium">
        Submit a Research Query
      </label>
      <textarea
        id="research-query"
        className="w-full border rounded p-2 min-h-[80px] resize-vertical"
        placeholder="E.g. What are the main findings about X in this project?"
        value={queryInput}
        onChange={onChange}
        required
        onKeyDown={onKeyDown}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Submit Query'}
        </Button>
      </div>
    </form>
  )
}
