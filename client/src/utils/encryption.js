import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

let serverPublicKey = null;

/**
 * Fetch and cache server's RSA public key
 */
export const fetchPublicKey = async (baseUrl) => {
  if (serverPublicKey) return serverPublicKey;
  
  try {
    console.log('[Encryption] Fetching public key from:', baseUrl + '/auth/public-key');
    const response = await fetch(`${baseUrl}/auth/public-key`);
    const data = await response.json();
    serverPublicKey = data.public_key;
    console.log('[Encryption] Public key fetched successfully');
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
  const key = CryptoJS.lib.WordArray.random(32);
  console.log('[Encryption] AES key generated');
  return key;
};

/**
 * Encrypt payload with AES (simple version - just encrypt the JSON)
 */
export const encryptWithAES = (data, aesKeyStr) => {
  try {
    console.log('[Encryption] Encrypting payload with AES');
    console.log('[Encryption] AES key type:', typeof aesKeyStr);
    console.log('[Encryption] AES key length:', aesKeyStr.length);
    
    const jsonStr = JSON.stringify(data);
    console.log('[Encryption] JSON data length:', jsonStr.length);
    
    // aesKeyStr should be a Base64 string, need to convert it for CryptoJS
    const encryptionKey = CryptoJS.enc.Base64.parse(aesKeyStr);
    console.log('[Encryption] Encryption key parsed from Base64');
    
    const encrypted = CryptoJS.AES.encrypt(jsonStr, encryptionKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    console.log('[Encryption] Encryption completed');
    const encryptedStr = encrypted.toString();
    console.log('[Encryption] Encrypted string length:', encryptedStr.length);
    console.log('[Encryption] AES encryption successful');
    return encryptedStr;
  } catch (error) {
    console.error('[Encryption] AES Encryption error:', error);
    console.error('[Encryption] Error details:', error.message);
    throw error;
  }
};

/**
 * Encrypt AES key with RSA using jsencrypt
 */
export const encryptWithRSA = async (aesKeyStr, publicKeyPEM) => {
  try {
    console.log('[Encryption] RSA encryption starting...');
    console.log('[Encryption] Creating JSEncrypt instance...');
    
    const encryptor = new JSEncrypt();
    console.log('[Encryption] JSEncrypt instance created');
    
    console.log('[Encryption] Setting public key...');
    console.log('[Encryption] Public key length:', publicKeyPEM.length);
    console.log('[Encryption] Public key starts with:', publicKeyPEM.substring(0, 50));
    
    encryptor.setPublicKey(publicKeyPEM);
    console.log('[Encryption] Public key set successfully');
    
    console.log('[Encryption] Encrypting AES key with RSA...');
    console.log('[Encryption] AES key to encrypt length:', aesKeyStr.length);
    
    const encrypted = encryptor.encrypt(aesKeyStr);
    console.log('[Encryption] RSA encryption completed');
    
    if (!encrypted) {
      console.error('[Encryption] RSA encryption returned empty result');
      throw new Error('RSA encryption returned null/empty');
    }
    
    console.log('[Encryption] RSA encryption successful, result length:', encrypted.length);
    return encrypted;
  } catch (error) {
    console.error('[Encryption] RSA Encryption error:', error);
    console.error('[Encryption] Error message:', error.message);
    throw error;
  }
};

/**
 * Prepare encrypted request payload
 */
export const prepareEncryptedPayload = async (data, baseUrl, publicKey) => {
  try {
    console.log('[Encryption] Starting payload encryption process...');
    
    // Generate random AES key
    const aesKey = generateAESKey();
    console.log('[Encryption] AES key generated, converting to Base64 string...');
    
    // Convert AES key to Base64 string
    const aesKeyStr = aesKey.toString(CryptoJS.enc.Base64);
    console.log('[Encryption] AES key converted to Base64, length:', aesKeyStr.length);
    
    // Encrypt payload with AES (pass the Base64 string)
    console.log('[Encryption] Encrypting payload...');
    const encryptedPayload = encryptWithAES(data, aesKeyStr);
    console.log('[Encryption] Payload encrypted, length:', encryptedPayload.length);
    
    // Encrypt AES key with server's RSA public key
    console.log('[Encryption] Encrypting AES key with RSA...');
    const encryptedKey = await encryptWithRSA(aesKeyStr, publicKey);
    console.log('[Encryption] AES key encrypted with RSA, length:', encryptedKey.length);
    
    console.log('[Encryption] Payload preparation complete');
    return {
      encrypted_payload: encryptedPayload,
      encrypted_key: encryptedKey,
    };
  } catch (error) {
    console.error('[Encryption] Error preparing encrypted payload:', error);
    console.error('[Encryption] Error stack:', error.stack);
    throw error;
  }
};
