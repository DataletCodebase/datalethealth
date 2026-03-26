import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Ensure these match the exact keys from backend/utils/encryption.js
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", "e1f2c3d4e5f6a7b8c9d0e1f2c3d4e5f6a7b8c9d0e1f2c3d4e5f6a7b8c9d0e1f2")

def get_key_bytes():
    return bytes.fromhex(ENCRYPTION_KEY)[:32]

def decrypt(encrypted_data: str) -> str:
    """
    Decrypts AES-256-GCM data encrypted by the Node.js backend.
    Expected format: "iv_hex:ciphertext_hex:authtag_hex"
    """
    if not encrypted_data or not isinstance(encrypted_data, str) or ":" not in encrypted_data:
        return encrypted_data
        
    try:
        parts = encrypted_data.split(":")
        if len(parts) != 3:
            return encrypted_data
            
        iv = bytes.fromhex(parts[0])
        ciphertext = bytes.fromhex(parts[1])
        auth_tag = bytes.fromhex(parts[2])
        
        aesgcm = AESGCM(get_key_bytes())
        # AESGCM in Python expects the auth_tag appended to the ciphertext
        decrypted = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted.decode("utf-8")
    except Exception as e:
        print(f"Python decryption error: {e}")
        return encrypted_data
