// EventPulse API Client
const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export function getStoredAuth() {
  try {
    const token = localStorage.getItem('eventpulse_token');
    const userStr = localStorage.getItem('eventpulse_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (e) {
    return { token: null, user: null };
  }
}

export function setStoredAuth(token, user) {
  if (token) {
    localStorage.setItem('eventpulse_token', token);
  } else {
    localStorage.removeItem('eventpulse_token');
  }
  if (user) {
    localStorage.setItem('eventpulse_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('eventpulse_user');
  }
}

export async function request(endpoint, options = {}) {
  const { token } = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    const err = new Error(netErr.message || 'Network connection error. Please verify the server is running.');
    err.statusCode = 0;
    throw err;
  }

  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (parseErr) {
    data = {
      success: false,
      message: rawText && rawText.length < 250 && !rawText.includes('<html') 
        ? rawText 
        : `Server returned status ${response.status} (${response.statusText || 'Error'})`
    };
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || data.error || `HTTP error ${response.status}: ${response.statusText || 'Unknown error'}`;
    const err = new Error(errorMsg);
    err.statusCode = response.status || data.statusCode;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth endpoints
  auth: {
    async register({ name, email, password, role = 'ATTENDEE' }) {
      return request('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
    },

    async login({ email, password }) {
      const res = await request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.accessToken) {
        setStoredAuth(res.data.accessToken, res.data.user);
      }
      return res;
    },

    async logout() {
      try {
        await request('/users/logout', { method: 'GET' });
      } catch (e) {
        // ignore logout errors
      } finally {
        setStoredAuth(null, null);
      }
    },

    async getMe() {
      return request('/users/me', { method: 'GET' });
    },

    async getAdminDashboard() {
      return request('/users/admin-dashboard', { method: 'GET' });
    },
  },

  // Events endpoints
  events: {
    async getAll() {
      return request('/events', { method: 'GET' });
    },

    async getById(id) {
      return request(`/events/${id}`, { method: 'GET' });
    },

    async create({ title, description, venue, start_time, status = 'PUBLISHED', tiers }) {
      return request('/events', {
        method: 'POST',
        body: JSON.stringify({ title, description, venue, start_time, status, tiers }),
      });
    },
  },

  // Bookings endpoints (Seat locking & Payment)
  bookings: {
    async lockSeat({ tier_id, quantity }) {
      return request('/bookings/lock', {
        method: 'POST',
        body: JSON.stringify({ tier_id: Number(tier_id), quantity: Number(quantity) }),
      });
    },

    async pay({ booking_id }) {
      return request('/bookings/pay', {
        method: 'POST',
        body: JSON.stringify({ booking_id: Number(booking_id) }),
      });
    },
  },

  // Check-ins (QR code validation)
  checkins: {
    async validate({ qr_code }) {
      return request('/checkins/validate', {
        method: 'POST',
        body: JSON.stringify({ qr_code: qr_code.trim() }),
      });
    },
  },

  // Analytics
  analytics: {
    async getOverview() {
      return request('/analytics/me', { method: 'GET' });
    },

    async getEventAnalytics(eventId) {
      return request(`/analytics/events/${eventId}`, { method: 'GET' });
    },
  },

  // Health
  async health() {
    const res = await fetch('/health');
    return res.json();
  }
};
