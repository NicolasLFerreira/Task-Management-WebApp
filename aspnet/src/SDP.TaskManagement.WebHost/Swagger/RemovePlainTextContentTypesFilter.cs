using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

namespace SDP.TaskManagement.WebHost.Swagger;

/// <summary>
/// This class ensures that responses from the api only state the response content body as application/json.
/// Related to an issue where the api client generator was using the wrong responseType.
/// </summary>
public class RemovePlainTextContentTypesFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.Responses == null) return;

        foreach (var response in operation.Responses.Values)
        {
            var keysToRemove = response.Content
                .Where(c => c.Key != "application/json")
                .Select(c => c.Key)
                .ToList();

            foreach (var key in keysToRemove)
            {
                response.Content.Remove(key);
            }
        }
    }
}
