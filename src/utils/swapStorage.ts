const STORAGE_KEY = 'pendingSwap';

export interface PendingSwapState {
  step: number;
  userDevice: any;
  email?: string;
  estimatedValue: number;
  targetDeviceId: string | null;
  targetDevicePrice: number;
}

export const loadPendingSwap = (): PendingSwapState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load pending swap', err);
    return null;
  }
};

export const savePendingSwap = (data: PendingSwapState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save pending swap', err);
  }
};

export const clearPendingSwap = () => {
  localStorage.removeItem(STORAGE_KEY);
};

