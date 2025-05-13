using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SDP.TaskManagement.Application.Abstractions;
using SDP.TaskManagement.Application.Services;
using SDP.TaskManagement.Application.Services.Auth;
using SDP.TaskManagement.Domain.Entities;
using SDP.TaskManagement.Infrastructure.Configuration;
using SDP.TaskManagement.Infrastructure.Managers;
using SDP.TaskManagement.Infrastructure.Persistence;
using SDP.TaskManagement.Infrastructure.Repository;
using SDP.TaskManagement.Infrastructure.Services;
using System.Text;

namespace SDP.TaskManagement.WebHost;

/// <summary>
/// Extensions for WebApplicationBuilder.Services to be used in Program.cs
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Handles dependency injection registration for the application.
    /// </summary>
    public static IServiceCollection AddDependencyInjection(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        // Register generic repository for all entity types
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        
        // Register specific repositories for all entities
        services.AddScoped<IRepository<User>, Repository<User>>();
        services.AddScoped<IRepository<Board>, Repository<Board>>();
        services.AddScoped<IRepository<List>, Repository<List>>();
        services.AddScoped<IRepository<TaskItem>, Repository<TaskItem>>();
        services.AddScoped<IRepository<Label>, Repository<Label>>();
        services.AddScoped<IRepository<Comment>, Repository<Comment>>();
        services.AddScoped<IRepository<Attachment>, Repository<Attachment>>();
        services.AddScoped<IRepository<Checklist>, Repository<Checklist>>();
        services.AddScoped<IRepository<ChecklistItem>, Repository<ChecklistItem>>();
        services.AddScoped<IRepository<BoardMember>, Repository<BoardMember>>();
        services.AddScoped<IRepository<Notification>, Repository<Notification>>();
        services.AddScoped<IRepository<Message>, Repository<Message>>();
        services.AddScoped<IRepository<TaskItemLabel>, Repository<TaskItemLabel>>();
        services.AddScoped<IRepository<TaskAssignee>, Repository<TaskAssignee>>();
        
        // Register services
        services.AddScoped<ITokenService, Application.Services.Auth.TokenService>();
        services.AddScoped<IUserManager, UserManager>();
        services.AddScoped<IAuthService, Application.Services.Auth.AuthService>();
        services.AddScoped<IFileSystemService,Infrastructure.Services.FileSystemService>();
        
        // Register domain services using the Abstractions namespace interfaces
        services.AddScoped<Application.Services.BoardService>();
        services.AddScoped<SDP.TaskManagement.Application.Abstractions.INotificationService, Application.Services.NotificationService>();
        services.AddScoped<Application.Services.TaskService>();
        
        // Register configuration options
        services.Configure<FileStorageOptions>(
            configuration.GetSection(FileStorageOptions.SectionName));
            
        return services;
    }

    public static IServiceCollection ConfigureCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(AppConfigurations.Cors.DefaultCorsPolicy, policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("Content-Disposition");
            });
        });

        return services;
    }
    
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? string.Empty);
        
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                ClockSkew = TimeSpan.Zero
            };
        });
        
        return services;
    }
    
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Task Management API", Version = "v1" });
            
            // Add custom schema ID provider to resolve naming conflicts
            c.CustomSchemaIds(type => 
            {
                // Return the full type name including namespace to avoid conflicts
                return type.FullName;
            });
            
            // Add JWT Authentication to Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });
            
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
        
        return services;
    }
}
