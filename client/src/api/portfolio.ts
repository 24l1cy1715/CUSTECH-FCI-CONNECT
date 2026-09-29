import apiClient from './client';
import {
  PublicPortfolioData,
  PortfolioSettingsData,
  UpdatePortfolioPayload,
  PortfolioConnectPayload,
} from '@/types/portfolio';

export async function fetchPublicPortfolio(username: string): Promise<PublicPortfolioData> {
  const { data } = await apiClient.get<{ success: boolean; data: PublicPortfolioData }>(
    `/portfolio/public/${encodeURIComponent(username)}`
  );
  return data.data;
}

export async function fetchMyPortfolioSettings(): Promise<PortfolioSettingsData> {
  const { data } = await apiClient.get<{ success: boolean; data: PortfolioSettingsData }>(
    '/portfolio/me'
  );
  return data.data;
}

export async function updateMyPortfolioSettings(
  payload: UpdatePortfolioPayload
): Promise<PortfolioSettingsData> {
  const { data } = await apiClient.patch<{ success: boolean; data: PortfolioSettingsData }>(
    '/portfolio/me',
    payload
  );
  return data.data;
}

export async function sendPortfolioConnectRequest(
  username: string,
  payload: PortfolioConnectPayload
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    `/portfolio/${encodeURIComponent(username)}/connect`,
    payload
  );
  return data;
}
