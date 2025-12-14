import axios from 'axios';
import { API_PATH } from '../backend_url';

export interface SwapDeviceDetails {
  category: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  condition: string;
  issues: string[];
  batteryHealth: string;
  images: string[]; // base64 strings
}

export interface SwapPayload {
  userDevice: SwapDeviceDetails;
  email: string;
  estimatedValue: number;
  targetDeviceId: string;
  targetDevicePrice: number;
  difference: number;
}

export interface SwapRequest {
  id: number | string;
  user_device: SwapDeviceDetails;
  estimated_value: number;
  target_device_id: string;
  target_device_price: number;
  difference: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const client = axios.create({
  baseURL: `${API_PATH}`,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export const swapApi = {
  async createSwap(payload: SwapPayload): Promise<SwapRequest> {
    const response = await client.post('/swap/create', {
      userDevice: payload.userDevice,
      email: payload.email,
      estimatedValue: payload.estimatedValue,
      targetDeviceId: payload.targetDeviceId,
      targetDevicePrice: payload.targetDevicePrice,
      difference: payload.difference,
    });
    return response.data;
  },

  async listSwaps(): Promise<SwapRequest[]> {
    const response = await client.get('/swap/my');
    return response.data;
  },
};

