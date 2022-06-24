using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Penman.Blazor.Quill.Internal
{
    public partial class ToolbarContentComposer
    {
        [CascadingParameter] public Toolbar Toolbar { get; set; }
        [CascadingParameter] public List<string> Fonts { get; set; }
    }
}
