namespace SDP.TaskManagement.WebHost.Configuration;

/// <summary>
/// Contains constants for configuration. Nested classes represent groups of relevant configuration settings.
/// </summary>
public static class AppConfigurations
{
    public static class Database
    {
        public const string DefaultConnection = "DefaultConnection";
    }

    public static class Cors
    {
        public const string DefaultCorsPolicy = "DefaultCorsPolicy";
    }

    public static class Jwt
    {
        public const string Issuer = "Jwt:Issuer";
        public const string Audience = "Jwt:Audience";
        public const string Key = "Jwt:Key";
    }
}
