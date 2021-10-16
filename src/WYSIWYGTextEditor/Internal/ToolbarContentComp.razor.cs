using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Text;

namespace WYSIWYGTextEditor.Internal
{
    public partial class ToolbarContentComp
    {
        [CascadingParameter] public Toolbar Toolbar { get; set; }
        [CascadingParameter] public List<string> Fonts { get; set; }
    }
}
