// PDF Progress tracking utility
const progressStore = new Map<string, {
  progress: number;
  stage: string;
  timestamp: number;
}>();

export function updatePdfProgress(contractId: number, progress: number, stage: string) {
  const progressKey = `pdf-${contractId}`;
  progressStore.set(progressKey, {
    progress: Math.min(100, Math.max(0, progress)),
    stage,
    timestamp: Date.now()
  });
  
  // Clean up old entries (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of progressStore.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      progressStore.delete(key);
    }
  }
}

export function getPdfProgress(contractId: number) {
  const progressKey = `pdf-${contractId}`;
  const progressData = progressStore.get(progressKey);
  
  if (!progressData) {
    return {
      progress: 0,
      stage: 'Not started',
      completed: false
    };
  }
  
  const isCompleted = progressData.progress >= 100;
  
  return {
    progress: progressData.progress,
    stage: progressData.stage,
    completed: isCompleted
  };
}

export function clearPdfProgress(contractId: number) {
  const progressKey = `pdf-${contractId}`;
  progressStore.delete(progressKey);
}