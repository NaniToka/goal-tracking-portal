/**
 * Map axios/network errors to user-facing messages.
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    if (!import.meta.env.VITE_API_URL) {
      return `Cannot reach the API server. Set VITE_API_URL to your backend (currently using ${apiUrl}).`;
    }
    return 'Cannot reach the API server. Check that the backend is running and CORS allows this site.';
  }

  return fallback;
}
