using Majorsoft.Blazor.Components.Common.JsInterop;
using Microsoft.Extensions.DependencyInjection;

namespace Penman.Blazor.Quill;

public static class PenmanQuillExtensions
{
    public static IServiceCollection AddPenmanQuill(this IServiceCollection services)
    {
        services.AddJsInteropExtensions();
        return services;
    }
}