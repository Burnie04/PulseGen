interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export const fetchAPI = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { token, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Network error',
    }));
    throw new Error(error.error || error.message || 'API request failed');
  }

  return response;
};

export const apiClient = {
  async register(email: string, password: string, fullName: string, role: string) {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetchAPI('/auth/me', { token });
    return response.json();
  },

  async uploadVideo(
    token: string,
    fileUrl: string,
    title: string,
    description: string
  ) {
    const response = await fetchAPI('/videos', {
      method: 'POST',
      token,
      body: JSON.stringify({ title, fileUrl, description, isPublic: false }),
    });
    return response.json();
  },

  async getVideos(token: string) {
    const response = await fetchAPI('/videos', { token });
    return response.json();
  },

  async getVideo(token: string, videoId: string) {
    const response = await fetchAPI(`/videos/${videoId}`, { token });
    return response.json();
  },

  async deleteVideo(token: string, videoId: string) {
    const response = await fetchAPI(`/videos/${videoId}`, {
      method: 'DELETE',
      token,
    });
    return response.json();
  },

  async getUsers(token: string) {
    const response = await fetchAPI('/users', { token });
    return response.json();
  },

  async updateUserRole(token: string, userId: string, role: string) {
    const response = await fetchAPI(`/users/${userId}/role`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  getStreamUrl(token: string, videoId: string): string {
    // Ensure this route exists in your backend (usually added in index.ts)
    return `${API_BASE_URL}/videos/stream/${videoId}?token=${token}`;
  },
};