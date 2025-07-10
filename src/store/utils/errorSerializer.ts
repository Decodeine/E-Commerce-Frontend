// Utility function to serialize errors for Redux state
export interface SerializedError {
  message: string;
  status?: number;
  code?: string;
  data?: any;
}

export const serializeError = (error: any): SerializedError => {
  // Handle Axios errors
  if (error.response) {
    return {
      message: error.response.data?.message || error.message || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code || error.code,
      data: error.response.data
    };
  }
  
  // Handle network errors
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Handle other errors
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR'
  };
};
