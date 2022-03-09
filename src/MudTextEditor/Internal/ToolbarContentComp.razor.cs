using Microsoft.AspNetCore.Components;

namespace MudTextEditor.Internal;

public partial class ToolbarContentComp
{
    [CascadingParameter] public Toolbar? Toolbar { get; set; }
    [CascadingParameter] public List<string>? Fonts { get; set; }
}