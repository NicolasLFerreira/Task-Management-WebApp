using Microsoft.OpenApi.Models;

using System.Reflection;

namespace SDP.TaskManagement.WebHost.Configuration.Swagger;

public static class SwaggerServiceExtensions
{
    /// <summary>
    /// Custom handler for swagger configuration.
    /// </summary>
    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new() { Title = "API", Version = "v1" });

            // Swagger security
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization header using the Bearer scheme."
            };

            options.AddSecurityDefinition("Bearer", securityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    securityScheme, Array.Empty<string>()
                }
            });

            // Document
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "TaskManagementWebApp API",
                Description = "API for our SDP project.",
                Contact = new OpenApiContact
                {
                    Name = "Nicolas Limbeger Ferreira",
                    Url = new Uri("https://github.com/NicolasLFerreira")
                },
                License = new OpenApiLicense
                {
                    Name = "MIT",
                    Url = new Uri("https://opensource.org/licenses/MIT")
                }
            });

            options.OperationFilter<RemovePlainTextContentTypesFilter>();

            // XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
        });

        return services;
    }
}
