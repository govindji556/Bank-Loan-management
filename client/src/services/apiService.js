const API_BASE_URL = "http://localhost:8000";

/**
 * Get authorization headers with Bearer token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};

/**
 * GET request
 */
export const apiGet = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`GET ${endpoint} failed: ${error.message}`);
  }
};

/**
 * POST request
 */
export const apiPost = async (endpoint, body = null, isFormData = false) => {
  try {
    const options = {
      method: "POST",
      headers: isFormData ? {} : getAuthHeaders(),
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`POST ${endpoint} failed: ${error.message}`);
  }
};

/**
 * PUT request
 */
export const apiPut = async (endpoint, body = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : null,
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`PUT ${endpoint} failed: ${error.message}`);
  }
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`DELETE ${endpoint} failed: ${error.message}`);
  }
};

/**
 * Handle response and throw error if not ok
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || `HTTP ${response.status}`;
    throw {
      status: response.status,
      message: errorMessage,
      data,
    };
  }

  return data;
};
