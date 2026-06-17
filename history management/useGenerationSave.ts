import { useCallback } from 'react';
import { addHistoryEntry } from '../utils/historyStorage';
import { ContentType } from '../types/history';

interface GenerationParams {
  title: string;
  prompt: string;
  contentType: ContentType;
  model?: string;
}

/**
 * useGenerationSave
 *
 * Call `saveGeneration` after a successful AI generation to persist
 * it to history. Returns the newly created HistoryEntry.
 *
 * Usage in your generation component:
 *
 *   const { saveGeneration, saveGenerationError } = useGenerationSave();
 *
 *   const handleGenerate = async () => {
 *     const result = await callClaudeAPI(prompt);
 *     saveGeneration({
 *       title: derivedTitle,
 *       prompt,
 *       contentType: 'blog',
 *       model: 'claude-sonnet-4-6',
 *     }, result.output, 'success', result.tokensUsed);
 *   };
 */
export function useGenerationSave() {
  const saveGeneration = useCallback(
    (
      params: GenerationParams,
      output: string,
      status: 'success' | 'failed' = 'success',
      tokensUsed?: number
    ) => {
      return addHistoryEntry({
        ...params,
        output,
        status,
        tokensUsed,
      });
    },
    []
  );

  return { saveGeneration };
}
