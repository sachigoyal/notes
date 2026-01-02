"use client"

import { useCallback, useEffect, useRef } from "react"

type AutoSaveOptions = {
  /** Delay in ms before saving (default: 1000) */
  delay?: number
  /** Called when save starts */
  onSaveStart?: () => void
  /** Called when save succeeds */
  onSaveSuccess?: () => void
  /** Called when save fails */
  onSaveError?: (error: Error) => void
}

type AutoSaveState = {
  /** Save the current content immediately */
  saveNow: () => Promise<void>
  /** Whether a save is in progress */
  isSaving: boolean
}

/**
 * Hook that provides debounced auto-save functionality.
 * Automatically saves content after a delay when it changes.
 */
export function useAutoSave(
  content: string,
  saveFn: (content: string) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveState {
  const { delay = 1000, onSaveStart, onSaveSuccess, onSaveError } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)
  const lastSavedContentRef = useRef(content)
  const pendingContentRef = useRef(content)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const performSave = useCallback(async (contentToSave: string) => {
    // Skip if content hasn't changed
    if (contentToSave === lastSavedContentRef.current) {
      return
    }

    isSavingRef.current = true
    onSaveStart?.()

    try {
      await saveFn(contentToSave)
      lastSavedContentRef.current = contentToSave
      onSaveSuccess?.()
    } catch (error) {
      onSaveError?.(error instanceof Error ? error : new Error("Save failed"))
    } finally {
      isSavingRef.current = false
    }
  }, [saveFn, onSaveStart, onSaveSuccess, onSaveError])

  // Debounced save on content change
  useEffect(() => {
    pendingContentRef.current = content

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for save
    timeoutRef.current = setTimeout(() => {
      performSave(content)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, delay, performSave])

  // Immediate save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await performSave(pendingContentRef.current)
  }, [performSave])

  return {
    saveNow,
    isSaving: isSavingRef.current,
  }
}

