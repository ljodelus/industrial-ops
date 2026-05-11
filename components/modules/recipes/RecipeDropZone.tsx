'use client'

// Client component — uses drag-and-drop browser APIs, file input ref, and event listeners

import { useRef } from 'react'
import { FileDown, X } from '@/lib/icons'
import { Button } from '@/components/ui'

export type DropZoneState = 'idle' | 'dragging' | 'loaded'

interface RecipeDropZoneProps {
  onFile:    (file: File) => void
  onRemove:  () => void
  state:     DropZoneState
  fileName?: string
  fileSize?: string
  error?:    string
}

export function RecipeDropZone({
  onFile,
  onRemove,
  state,
  fileName,
  fileSize,
  error,
}: RecipeDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleClick = () => {
    if (state !== 'loaded') inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  const zoneClass =
    state === 'loaded'
      ? 'border-status-ok bg-status-ok/5'
      : state === 'dragging'
      ? 'border-accent-primary bg-accent-primary/5'
      : 'border-scada-border bg-scada-bg hover:border-text-muted'

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-scada transition-colors ${zoneClass} ${state !== 'loaded' ? 'cursor-pointer' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {state !== 'loaded' ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <FileDown size={40} className="text-text-muted" />
            <p className="text-text-primary text-sm font-mono">Drop JSON file here</p>
            <p className="text-text-muted text-xs font-mono">or click to browse</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-text-muted text-xs">Accepted: .json files only</p>
              <p className="text-text-muted text-xs">Max size: 5 MB</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-status-ok text-sm font-mono">✔</span>
            <span className="text-text-primary text-xs font-mono flex-1 truncate">{fileName}</span>
            <span className="text-text-muted text-xs">{fileSize}</span>
            <div onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={onRemove}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-status-alarm text-xs font-mono">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}

