import crypto from 'crypto';

interface SafeData {
  hash: string;
  data: any;
}

export const computeHash = (data: any): string => {
  const stringified = JSON.stringify(data);
  return crypto.createHash('sha256').update(stringified).digest('hex');
};

export const verifyData = (data: any, safeData: SafeData): boolean => {
  const currentHash = computeHash(data);
  return currentHash === safeData.hash;
};

export const createSafeData = (data: any): SafeData => {
  return {
    hash: computeHash(data),
    data,
  };
};

// Example usage:
// const safeData = createSafeData(schedules);
// const isTampered = !verifyData(schedules, safeData);
// if (isTampered) {
//   console.warn('Data has been tampered with!');
// } 