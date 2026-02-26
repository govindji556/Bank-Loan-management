import json
import base64
from pathlib import Path
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

KEY_DIR = Path(__file__).parent.parent.parent / "keys"

class EncryptionManager:
    def __init__(self):
        KEY_DIR.mkdir(exist_ok=True)
        self.private_key_path = KEY_DIR / "private_key.pem"
        self.public_key_path = KEY_DIR / "public_key.pem"
        self._load_or_generate_keys()
    
    def _load_or_generate_keys(self):
        """Load or generate RSA keys"""
        if self.private_key_path.exists() and self.public_key_path.exists():
            with open(self.private_key_path, "rb") as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(), password=None, backend=default_backend()
                )
            with open(self.public_key_path, "rb") as f:
                self.public_key = serialization.load_pem_public_key(
                    f.read(), backend=default_backend()
                )
        else:
            self._generate_keys()
    
    def _generate_keys(self):
        """Generate and save new RSA key pair"""
        self.private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=2048, backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
        
        # Save keys
        with open(self.private_key_path, "wb") as f:
            f.write(self.private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        with open(self.public_key_path, "wb") as f:
            f.write(self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
    
    def get_public_key_pem(self) -> str:
        """Return public key in PEM format"""
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
    
    def decrypt_aes_key(self, encrypted_key: str) -> str:
        """Decrypt AES key using RSA private key"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_key)
        except Exception as e:
            raise ValueError(f"Invalid base64 for encrypted AES key: {str(e)}")

        # Try OAEP (preferred). If that fails, fall back to PKCS#1 v1.5
        last_exc = None
        try:
            decrypted = self.private_key.decrypt(
                encrypted_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            print("[DEBUG] AES key decrypted using OAEP")
            return decrypted.decode('utf-8')
        except Exception as e:
            last_exc = e
            print(f"[DEBUG] OAEP decryption failed: {str(e)} - attempting PKCS1v15 fallback")

        try:
            decrypted = self.private_key.decrypt(
                encrypted_bytes,
                padding.PKCS1v15()
            )
            print("[DEBUG] AES key decrypted using PKCS1v15 (fallback)")
            return decrypted.decode('utf-8')
        except Exception as e2:
            print(f"[ERROR] PKCS1v15 decryption also failed: {str(e2)}")
            raise ValueError(f"Failed to decrypt AES key (OAEP error: {last_exc}; PKCS1v15 error: {e2})")
    
    def decrypt_payload(self, encrypted_payload: str, aes_key_str: str) -> dict:
        """
        Decrypt payload using AES ECB mode (matches frontend CryptoJS implementation)
        """
        try:
            # Convert Base64 AES key string back to bytes
            aes_key_bytes = base64.b64decode(aes_key_str)
            
            # Decrypt the payload using AES ECB mode with PKCS7 padding
            cipher = Cipher(
                algorithms.AES(aes_key_bytes),
                modes.ECB(),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()
            
            # Decode the Base64 encrypted payload
            encrypted_bytes = base64.b64decode(encrypted_payload)
            
            # Decrypt
            decrypted_bytes = decryptor.update(encrypted_bytes) + decryptor.finalize()
            
            # Remove PKCS7 padding manually
            padding_length = decrypted_bytes[-1]
            decrypted_bytes = decrypted_bytes[:-padding_length]
            
            # Decode JSON
            json_str = decrypted_bytes.decode('utf-8')
            return json.loads(json_str)
        except Exception as e:
            raise ValueError(f"Failed to decrypt payload: {str(e)}")

# Global instance
encryption_manager = EncryptionManager()
