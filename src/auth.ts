const AUTH_TOKEN_KEY = 'auth-token';

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getAuthHeaders() {
    const token = getAuthToken()
    return token
        ? { Authorization: token }
        : {}
}

export const TEST_USER_TOKEN = 'test_user_token'
export const TEST_ADMIN_TOKEN = 'test_admin_token'
export const TEST_VIEWER_TOKEN = 'test_viewer_token'
export const ANONYMOUS_TOKEN = 'Anonymous'

export const TEST_TOKENS = [
    { name: 'Anonymous', token: ANONYMOUS_TOKEN },
    { name: 'Viewer', token: TEST_VIEWER_TOKEN },
    { name: 'Property Editor', token: TEST_USER_TOKEN },
    { name: 'Admin', token: TEST_ADMIN_TOKEN }
]

export const has_edit_properties_rights = (token: string | null) => ([TEST_ADMIN_TOKEN, TEST_USER_TOKEN].indexOf(token) != -1)
export const has_edit_geometry_rights = (token: string | null) => (token === TEST_ADMIN_TOKEN)
export const has_viewer_rights = (token: string | null) => (token != null)
