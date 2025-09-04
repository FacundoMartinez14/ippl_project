import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// ===== helpers =====
const PROTECTED_PREFIXES = [
	'/admin',
	'/financial',
	'/professional',
	'/content',
];
const isProtectedPath = (pathname: string) =>
	PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

function decodeJwtPayload(token: string): any | null {
	try {
		const [, payloadB64] = token.split('.');
		if (!payloadB64) return null;
		const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
		const json = atob(base64);
		return JSON.parse(json);
	} catch {
		return null;
	}
}
function isTokenExpired(token: string, skewSeconds = 30): boolean {
	const payload = decodeJwtPayload(token);
	if (!payload || typeof payload.exp !== 'number') return true;
	const now = Math.floor(Date.now() / 1000);
	return now >= payload.exp - skewSeconds;
}

const api = axios.create({
	baseURL: BASE_URL,
	headers: { 'Content-Type': 'application/json' },
});

// ===== REQUEST interceptor (logs) =====
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		const path = window.location.pathname;
		const inProtected = isProtectedPath(path);

		console.log('[API][REQ]', {
			path,
			inProtected,
			hasToken: !!token,
		});

		if (token) {
			const expired = isTokenExpired(token);
			console.log('[API][REQ] tokenStatus', { expired });
			if (expired) {
				localStorage.removeItem('token');
				if (inProtected && path !== '/login') {
					console.warn(
						'[API][REQ] REDIRECT by expired token on protected path:',
						path
					);
					window.location.replace('/login');
					return Promise.reject(
						new axios.Cancel('redirect/login (expired token)')
					);
				}
			} else {
				// token OK
				(config.headers as any).Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// ===== RESPONSE interceptor (logs) =====
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error?.response?.status;
		const data = error?.response?.data;
		const path = window.location.pathname;
		const inProtected = isProtectedPath(path);

		console.log('[API][RES][ERR]', {
			path,
			inProtected,
			status,
			data,
			url: error?.config?.url,
			method: error?.config?.method,
		});

		if (
			(status === 401 || status === 403) &&
			inProtected &&
			path !== '/login'
		) {
			console.warn(
				'[API][RES][ERR] REDIRECT by backend 401/403 on protected path:',
				path
			);
			localStorage.removeItem('token');
			window.location.replace('/login');
			return;
		}

		return Promise.reject(error);
	}
);

export default api;
