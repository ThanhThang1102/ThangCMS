using System.Security.Cryptography;
using System.Text;
using System.Net;

namespace CMS.Backend.Services
{
    /// <summary>
    /// VNPay helper - tạo URL thanh toán và xác thực chữ ký IPN/ReturnUrl
    /// </summary>
    public class VNPayHelper
    {
        private readonly SortedList<string, string> _requestData = new SortedList<string, string>(StringComparer.InvariantCultureIgnoreCase);

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
                _requestData[key] = value;
        }

        /// <summary>Tạo URL thanh toán có kèm chữ ký HMAC-SHA512</summary>
        public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
        {
            var data = new StringBuilder();
            foreach (var kv in _requestData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }

            string queryString = data.ToString().TrimEnd('&');
            string secureHash = HmacSHA512(vnpHashSecret, queryString);
            return baseUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
        }

        /// <summary>Xác thực chữ ký khi VNPay callback về ReturnUrl / IPN</summary>
        public static bool ValidateSignature(IQueryCollection queryParams, string vnpHashSecret)
        {
            var vnpSecureHash = queryParams["vnp_SecureHash"].ToString();

            // Loại bỏ 2 param chữ ký khỏi data để tính lại
            var sortedParams = queryParams
                .Where(p => p.Key != "vnp_SecureHash" && p.Key != "vnp_SecureHashType")
                .OrderBy(p => p.Key, StringComparer.InvariantCultureIgnoreCase)
                .ToList();

            var signData = new StringBuilder();
            foreach (var kv in sortedParams)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                    signData.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }

            string rawHash = signData.ToString().TrimEnd('&');
            string computedHash = HmacSHA512(vnpHashSecret, rawHash);
            return computedHash.Equals(vnpSecureHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private static string HmacSHA512(string key, string inputData)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);
            return BitConverter.ToString(hashValue).Replace("-", "").ToLower();
        }
    }
}
