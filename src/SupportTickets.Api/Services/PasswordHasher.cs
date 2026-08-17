using System.Security.Cryptography;
namespace SupportTickets.Api.Services;
public interface IPasswordHasher { string Hash(string password); bool Verify(string password, string hash); }
public sealed class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }
    public bool Verify(string password, string hash)
    {
        var parts = hash.Split('.'); if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]); var expected = Convert.FromBase64String(parts[1]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}
