import CryptoJS from 'crypto-js';

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
export const encryptWithAES = (data, aesKey) => {
  try {
    console.log('[Encryption] Encrypting payload with AES');
    const jsonStr = JSON.stringify(data);
    
    const encrypted = CryptoJS.AES.encrypt(jsonStr, aesKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const encryptedStr = encrypted.toString();
    console.log('[Encryption] AES encryption successful');
    return encryptedStr;
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
    console.log('[Encryption] Starting RSA encryption, checking JSEncrypt...');
    
    // Check if JSEncrypt is available
    if (typeof window.JSEncrypt === 'undefined') {
      console.log('[Encryption] JSEncrypt not found, loading from CDN...');
      await loadJSEncrypt();
    }
    
    console.log('[Encryption] JSEncrypt available, encrypting AES key...');
    const encryptor = new window.JSEncrypt();
    encryptor.setPublicKey(publicKeyPEM);
    
    const encrypted = encryptor.encrypt(aesKeyStr);
    
    if (!encrypted) {
      throw new Error('RSA encryption returned null/empty');
    }
    
    console.log('[Encryption] RSA encryption successful, encrypted key length:', encrypted.length);
    return encrypted;
  } catch (error) {
    console.error('[Encryption] RSA Encryption error:', error);
    throw error;
  }
};

/**
 * Load JSEncrypt library from CDN
 */
const loadJSEncrypt = () => {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsencrypt@3.3.4/bin/jsencrypt.min.js';
      script.async = true;
      
      script.onload = () => {
        console.log('[Encryption] JSEncrypt loaded successfully from CDN');
        resolve();
      };
      
      script.onerror = () => {
        console.error('[Encryption] Failed to load JSEncrypt from CDN');
        reject(new Error('Failed to load JSEncrypt library'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('[Encryption] Error loading JSEncrypt:', error);
      reject(error);
    }
  });
};

/**
 * Prepare encrypted request payload
 */
export const prepareEncryptedPayload = async (data, baseUrl, publicKey) => {
  try {
    console.log('[Encryption] Starting payload encryption process...');
    
    // Generate random AES key
    const aesKey = generateAESKey();
    console.log('[Encryption] AES key generated, converting to string...');
    
    // Convert AES key to Base64 string
    const aesKeyStr = aesKey.toString(CryptoJS.enc.Base64);
    console.log('[Encryption] AES key converted to Base64');
    
    // Encrypt payload with AES
    console.log('[Encryption] Encrypting payload...');
    const encryptedPayload = encryptWithAES(data, aesKey);
    console.log('[Encryption] Payload encrypted');
    
    // Encrypt AES key with server's RSA public key
    console.log('[Encryption] Encrypting AES key with RSA...');
    const encryptedKey = await encryptWithRSA(aesKeyStr, publicKey);
    console.log('[Encryption] AES key encrypted with RSA');
    
    console.log('[Encryption] Payload preparation complete');
    return {
      encrypted_payload: encryptedPayload,
      encrypted_key: encryptedKey,
    };
  } catch (error) {
    console.error('[Encryption] Error preparing encrypted payload:', error);
    throw error;
  }
};
