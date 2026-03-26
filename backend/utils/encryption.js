import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Ensure these are exactly 64 characters (32 bytes hex) and 32 characters (16 bytes hex)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "e1f2c3d4e5f6a7b8c9d0e1f2c3d4e5f6a7b8c9d0e1f2c3d4e5f6a7b8c9d0e1f2";
const STATIC_IV = process.env.STATIC_IV || "a1b2c3d4e5f6a7b8c9d0e1f2c3d4e5f6"; 

// Helper to get buffer
const getKeyBuffer = () => Buffer.from(ENCRYPTION_KEY, "hex").slice(0, 32); 
const getStaticIvBuffer = () => Buffer.from(STATIC_IV, "hex").slice(0, 16);

/**
 * Encrypt using AES-256-GCM (Random IV). Best for non-searchable data.
 */
export const encrypt = (text) => {
  if (text === null || text === undefined || text === "") return text;
  text = String(text);
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", getKeyBuffer(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch(err) {
    console.error("Encryption error:", err);
    return text;
  }
};

/**
 * Decrypt using AES-256-GCM
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== "string" || !encryptedData.includes(":")) return encryptedData;
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return encryptedData;
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKeyBuffer(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    return encryptedData; 
  }
};

/**
 * Encrypt using AES-256-CBC (Static IV). Best for deterministic searching (like email/mobile).
 */
export const encryptDeterministic = (text) => {
  if (text === null || text === undefined || text === "") return text;
  text = String(text);
  
  // If already deterministically encrypted (no colon, valid hex), don't double encrypt
  // A bit risky but helpful if data is mixed
  if (/^[0-9a-fA-F]+$/.test(text) && text.length > 20) {
     // Might already be encrypted, we will just proceed anyway or add a prefix
     // Actually let's assume raw text is never just a huge hex string, or we should handle it
  }
  
  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", getKeyBuffer(), getStaticIvBuffer());
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch(err) {
    console.error("Deterministic encryption error:", err);
    return text;
  }
};

/**
 * Decrypt using AES-256-CBC (Static IV).
 */
export const decryptDeterministic = (encryptedData) => {
  // Try to avoid decrypting GCM data or unencrypted text
  if (!encryptedData || typeof encryptedData !== "string" || encryptedData.includes(":")) return encryptedData;
  
  // Check if it looks like a hex string
  if (!/^[0-9a-fA-F]+$/.test(encryptedData)) {
    return encryptedData; // Not hex, probably plaintext
  }

  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", getKeyBuffer(), getStaticIvBuffer());
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // console.error("Deterministic decryption error:", err.message);
    return encryptedData; // fallback
  }
};
