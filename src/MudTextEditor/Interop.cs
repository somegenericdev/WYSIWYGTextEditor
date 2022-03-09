using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace MudTextEditor
{
    public static class Interop
    {
        internal static ValueTask<object> CreateQuill(
            IJSRuntime jsRuntime,
            ElementReference quillElement,
            ElementReference toolbar,
            bool? readOnly,
            string placeholder,
            string theme,
            string? debugLevel,
            List<string>? customFonts=null)
        {
            return jsRuntime.InvokeAsync<object>(
                "QuillFunctions.createQuill", 
                quillElement, toolbar, readOnly, 
                placeholder, theme, debugLevel, customFonts);
        }

        internal static ValueTask<string> GetText(
            IJSRuntime jsRuntime,
            ElementReference quillElement)
        {
            return jsRuntime.InvokeAsync<string>(
                "QuillFunctions.getQuillText", 
                quillElement);
        }

        internal static ValueTask<string?> GetHtml(
            IJSRuntime jsRuntime,
            ElementReference quillElement)
        {
            return jsRuntime.InvokeAsync<string>(
                "QuillFunctions.getQuillHTML", 
                quillElement)!;
        }

        internal static ValueTask<string?> GetContent(
            IJSRuntime jsRuntime,
            ElementReference quillElement)
        {
            return jsRuntime.InvokeAsync<string>(
                "QuillFunctions.getQuillContent", 
                quillElement)!;
        }

        internal static ValueTask<object> LoadQuillContent(
            IJSRuntime jsRuntime,
            ElementReference quillElement,
            string? content)
        {
            return jsRuntime.InvokeAsync<object>(
                "QuillFunctions.loadQuillContent", 
                quillElement, content);
        }

        internal static ValueTask<object> LoadQuillHtmlContent(
            IJSRuntime jsRuntime,
            ElementReference quillElement,
            string quillHtmlContent)
        {
            return jsRuntime.InvokeAsync<object>(
                "QuillFunctions.loadQuillHTMLContent",
                quillElement, quillHtmlContent);
        }

        internal static ValueTask<object> EnableQuillEditor(
            IJSRuntime jsRuntime,
            ElementReference quillElement,
            bool mode)
        {
            return jsRuntime.InvokeAsync<object>(
                "QuillFunctions.enableQuillEditor", 
                quillElement, mode);
        }

        internal static ValueTask<object> InsertQuillImage(
            IJSRuntime jsRuntime,
            ElementReference quillElement,
            string imageUrl)
        {
            return jsRuntime.InvokeAsync<object>(
                "QuillFunctions.insertQuillImage",
                quillElement, imageUrl);
        }

    }
}