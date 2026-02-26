import CryptoJS from 'crypto-js';

let serverPublicKey = null;

/**
 * Fetch and cache server's RSA public key
 */
export const fetchPublicKey = async (baseUrl) => {
  if (serverPublicKey) return serverPublicKey;
  
  try {
    const response = await fetch(`${baseUrl}/auth/public-key`);
    const data = await response.json();
    serverPublicKey = data.public_key;
    return serverPublicKey;
  } catch (error) {
    console.error('Failed to fetch public key:', error);
    throw error;
  }
};

/**
 * Generate random AES key (32 bytes for 256-bit encryption)
 */
export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(32);
};

/**
 * Encrypt payload with AES
 */
export const encryptWithAES = (data, aesKey) => {
  try {
    const jsonStr = JSON.stringify(data);
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(jsonStr, aesKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: iv,
    });
    
    // Combine IV + ciphertext for transmission
    const ivStr = iv.toString(CryptoJS.enc.Base64);
    const ciphertextStr = encrypted.toString();
    
    return `${ivStr}:${ciphertextStr}`;
  } catch (error) {
    console.error('AES Encryption error:', error);
    throw error;
  }
};

/**
 * Encrypt AES key with RSA using jsencrypt
 */
export const encryptWithRSA = async (aesKeyStr, publicKeyPEM) => {
  try {
    // Dynamically import JSEncrypt if needed
    if (typeof window.JSEncrypt === 'undefined') {
      // Fallback: if JSEncrypt not loaded, load it
      await loadJSEncrypt();
    }
    
    const encryptor = new (window.JSEncrypt)();
    encryptor.setPublicKey(publicKeyPEM);
    const encrypted = encryptor.encrypt(aesKeyStr);
    
    if (!encrypted) {
      throw new Error('RSA encryption failed - returned null');
    }
    
    return encrypted;
  } catch (error) {
    console.error('RSA Encryption error:', error);
    throw error;
  }
};

/**
 * Load JSEncrypt library if not already loaded
 */
const loadJSEncrypt = async () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsencrypt@3.3.4/bin/jsencrypt.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Prepare encrypted request payload
 */
export const prepareEncryptedPayload = async (data, baseUrl, publicKey) => {
  try {
    // Generate random AES key
    const aesKey = generateAESKey();
    const aesKeyStr = aesKey.toString(CryptoJS.enc.Base64);
    
    // Encrypt payload with AES
    const encryptedPayload = encryptWithAES(data, aesKey);
    
    // Encrypt AES key with server's RSA public key
    const encryptedKey = await encryptWithRSA(aesKeyStr, publicKey);
    
    return {
      encrypted_payload: encryptedPayload,
      encrypted_key: encryptedKey,
    };
  } catch (error) {
    console.error('Error preparing encrypted payload:', error);
    throw error;
  }
};
