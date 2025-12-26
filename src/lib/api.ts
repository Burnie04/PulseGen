const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export const fetchAPI = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
    throw new Error(error.error || 'API request failed');
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
    file: File,
    title: string,
    description: string
  ) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    const url = `${API_BASE_URL}/videos`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Upload failed',
      }));
      throw new Error(error.error || 'Video upload failed');
    }

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
    return `${API_BASE_URL}/stream/${videoId}?token=${token}`;
  },
};
