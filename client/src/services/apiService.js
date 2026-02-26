import { fetchPublicKey, prepareEncryptedPayload } from "../utils/encryption.js";

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

/**
 * POST request with RSA+AES encryption
 */
export const apiPostEncrypted = async (endpoint, body = null) => {
  try {
    console.log('[API] Encrypted POST request to:', endpoint);
    
    // Fetch server's public key
    console.log('[API] Step 1: Fetching public key...');
    const publicKey = await fetchPublicKey(API_BASE_URL);
    console.log('[API] Step 2: Public key obtained');
    
    // Prepare encrypted payload
    console.log('[API] Step 3: Preparing encrypted payload...');
    const encryptedPayload = await prepareEncryptedPayload(body, API_BASE_URL, publicKey);
    console.log('[API] Step 4: Payload encrypted successfully');
    console.log('[API] Encrypted payload keys:', Object.keys(encryptedPayload));
    console.log('[API] Encrypted payload size:', {
      payload: encryptedPayload.encrypted_payload.length,
      key: encryptedPayload.encrypted_key.length
    });
    
    // Send encrypted request
    console.log('[API] Step 5: Sending encrypted request...');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(encryptedPayload),
    });
    
    console.log('[API] Step 6: Response received, status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Response error:', errorText);
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error('[API] Encrypted POST error:', error);
    console.error('[API] Error stack:', error.stack);
    throw new Error(`POST ${endpoint} failed: ${error.message}`);
  }
};
