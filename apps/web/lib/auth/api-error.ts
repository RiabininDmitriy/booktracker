export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) {
      return data.message[0] ?? 'Request failed';
    }
    if (typeof data?.message === 'string') {
      return data.message;
    }
  }

  if (typeof error === 'object' && error && 'error' in error) {
    const transportError = (error as { error?: string }).error;
    if (transportError) {
      return transportError;
    }
  }

  return fallbackMessage;
}
