// Offline caching utility for clergy planning progress

const CACHE_KEY_PREFIX = 'clergy_planning_';

export const getCacheKey = (churchId: string, type: string) => {
  return `${CACHE_KEY_PREFIX}${churchId}_${type}`;
};

export const saveToCache = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to cache:', error);
    return false;
  }
};

export const loadFromCache = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from cache:', error);
    return null;
  }
};

export const clearCache = (churchId: string) => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`${CACHE_KEY_PREFIX}${churchId}_`)) {
      localStorage.removeItem(key);
    }
  });
};

// Sync offline changes back to database
export const syncOfflineChanges = async (
  churchId: string, 
  syncFn: (data: any) => Promise<void>
) => {
  const cacheKeys = Object.keys(localStorage).filter(key => 
    key.startsWith(`${CACHE_KEY_PREFIX}${churchId}_`)
  );

  for (const key of cacheKeys) {
    const data = loadFromCache(key);
    if (data && (data as any).offline) {
      try {
        await syncFn(data);
        // Clear the offline flag after successful sync
        const updatedData = { ...data, offline: false };
        saveToCache(key, updatedData);
      } catch (error) {
        console.error(`Failed to sync ${key}:`, error);
      }
    }
  }
};

