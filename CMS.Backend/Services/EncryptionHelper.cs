using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace CMS.Backend.Services
{
    public static class EncryptionHelper
    {
        // 32-byte key for AES-256, 16-byte IV for block size
        private static readonly string KeyString = "ThangCMSSecretKey123456789012345";
        private static readonly string IvString = "ThangCMSSecretIv";

        public static string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return plainText;

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(KeyString);
                aesAlg.IV = Encoding.UTF8.GetBytes(IvString);

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(plainText);
                        }
                    }
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        public static string Decrypt(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText)) return cipherText;

            // Check if it is a valid base64 representation of AES ciphertext.
            // BCrypt hashes start with '$2' and are 60 characters long, which won't pass TryFromBase64String.
            Span<byte> buffer = new Span<byte>(new byte[cipherText.Length]);
            if (!Convert.TryFromBase64String(cipherText, buffer, out int bytesWritten))
            {
                return cipherText; // Fallback to raw/BCrypt if not valid base64
            }

            try
            {
                using (Aes aesAlg = Aes.Create())
                {
                    aesAlg.Key = Encoding.UTF8.GetBytes(KeyString);
                    aesAlg.IV = Encoding.UTF8.GetBytes(IvString);

                    ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                    using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(cipherText)))
                    {
                        using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {
                            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                            {
                                return srDecrypt.ReadToEnd();
                            }
                        }
                    }
                }
            }
            catch
            {
                return cipherText; // Fallback to raw if decryption fails (e.g. invalid key/iv, or legacy data)
            }
        }
    }
}
