import { encrypt, decrypt } from "./utils/encryption.js";

const text = "Ritish Kumar Ray";
const enc = encrypt(text);
console.log("Encrypted:", enc);

const dec = decrypt(enc);
console.log("Decrypted:", dec);

if (text !== dec) {
  console.log("FAILED DECRYPTION");
} else {
  console.log("SUCCESS");
}
