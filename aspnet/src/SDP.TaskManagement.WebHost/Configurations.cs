namespace SDP.TaskManagement.WebHost;

/// <summary>
/// Contains constants for configuration. Nested classes represent nested configurations.
/// </summary>
public static class Configurations
{
    public static class Jwt
    {
        public const string Issuer = "Jwt:Issuer";
        public const string Audience = "Jwt:Audience";
        public const string Key = "Jwt:Key";
    }
}
