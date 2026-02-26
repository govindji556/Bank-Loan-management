import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

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
    console.error('[Encryption] Failed to fetch public key:', error);
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
 * Encrypt payload with AES (simple version - just encrypt the JSON)
 */
export const encryptWithAES = (data, aesKeyStr) => {
  try {
    const jsonStr = JSON.stringify(data);
    const encryptionKey = CryptoJS.enc.Base64.parse(aesKeyStr);
    const encrypted = CryptoJS.AES.encrypt(jsonStr, encryptionKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (error) {
    console.error('[Encryption] AES Encryption error:', error);
    throw error;
  }
};

/**
 * Encrypt AES key with RSA using jsencrypt
 */
export const encryptWithRSA = async (aesKeyStr, publicKeyPEM) => {
  try {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKeyPEM);
    const encrypted = encryptor.encrypt(aesKeyStr);
    if (!encrypted) throw new Error('RSA encryption returned null/empty');
    return encrypted;
  } catch (error) {
    console.error('[Encryption] RSA Encryption error:', error);
    throw error;
  }
};

/**
 * Prepare encrypted request payload
 */
export const prepareEncryptedPayload = async (data, baseUrl, publicKey) => {
  try {
    const aesKey = generateAESKey();
    const aesKeyStr = aesKey.toString(CryptoJS.enc.Base64);
    const encryptedPayload = encryptWithAES(data, aesKeyStr);
    const encryptedKey = await encryptWithRSA(aesKeyStr, publicKey);
    return {
      encrypted_payload: encryptedPayload,
      encrypted_key: encryptedKey,
    };
  } catch (error) {
    console.error('[Encryption] Error preparing encrypted payload:', error);
    throw error;
  }
};
