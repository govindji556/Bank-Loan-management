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
 * Generate random AES key (32 bytes)
 */
export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(32);
};

/**
 * Encrypt payload with AES
 */
export const encryptWithAES = (data, aesKey) => {
  const jsonStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, aesKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

/**
 * Encrypt AES key with RSA using jsencrypt
 */
export const encryptWithRSA = (aesKeyStr, publicKeyPEM) => {
  const encryptor = new (window.JSEncrypt)();
  encryptor.setPublicKey(publicKeyPEM);
  return encryptor.encrypt(aesKeyStr);
};

/**
 * Prepare encrypted request payload
 */
export const prepareEncryptedPayload = async (data, baseUrl, publicKey) => {
  // Generate random AES key
  const aesKey = generateAESKey();
  const aesKeyStr = aesKey.toString();
  
  // Encrypt payload
  const encryptedPayload = encryptWithAES(data, aesKey);
  
  // Encrypt AES key with server's RSA public key
  const encryptedKey = encryptWithRSA(aesKeyStr, publicKey);
  
  return {
    encrypted_payload: encryptedPayload,
    encrypted_key: encryptedKey,
  };
};
