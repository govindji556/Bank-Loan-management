import json
import base64
from pathlib import Path
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet

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
            decrypted = self.private_key.decrypt(
                encrypted_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return decrypted.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Failed to decrypt AES key: {str(e)}")
    
    def decrypt_payload(self, encrypted_payload: str, aes_key_str: str) -> dict:
        """Decrypt payload using Fernet (AES)"""
        try:
            # Pad key to 32 bytes if needed
            aes_key = aes_key_str.encode()
            if len(aes_key) < 32:
                aes_key = aes_key.ljust(32, b'0')
            
            # Create Fernet cipher with base64 encoded key
            key = base64.urlsafe_b64encode(aes_key[:32])
            cipher = Fernet(key)
            decrypted = cipher.decrypt(encrypted_payload.encode())
            return json.loads(decrypted.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Failed to decrypt payload: {str(e)}")

# Global instance
encryption_manager = EncryptionManager()
