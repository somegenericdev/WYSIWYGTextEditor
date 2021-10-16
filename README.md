# Blazored TextEditor
WYSIWYG Rich Text Editor for Blazor applications - Uses [Quill JS](https://quilljs.com/ "Quill JS.com") and was forked from [Blazored.TextEditor] (https://github.com/Blazored/TextEditor)

![Screenshot](HTMLExample.png)


### Installing

You can install from NuGet using the following command:

`Install-Package Blazored.TextEditor`

Or via the Visual Studio package manger.

### Setup
Blazor Server applications will need to include the following CSS and JS files in their `Pages\_Host.cshtml`.

In the `head` tag add the following CSS.

```html
    <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <link href="//cdn.quilljs.com/1.3.6/quill.bubble.css" rel="stylesheet">
```

Then add the JS script at the bottom of the page using the following script tag.

```html
    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script src="_content/WYSIWYGTextEditor/quill-blot-formatter.min.js"></script>
    <script src="_content/WYSIWYGTextEditor/BlazorQuill.js"></script>
```

**NOTE** If you're using Blazor WebAssembly then these need to be added to your `wwwroot\index.html`.

You can add the following using statement to your main `_Imports.razor` to make referencing the component a bit easier.

```cs
@using WYSIWYGTextEditor
```

## Usage

Below is a list of all the options available on the Text Editor.

**Templates**

- `ToolbarContent` (optional) - Allows the user to define the Toolbar (above the editor control, or in-line when using the bubble theme, and a user highlights text in the editor).
- `EditorContent` (optional) - Allows the user to define the initial content

**Parameters**

- `ReadOnly` (Optional - Default: `false`) - Determines if the editor will load in read-only mode. This mode can be toggled.
- `Placeholder` (Optional - Default: `Compose an epic...`) - The text to show when editor is empty.
- `Theme` (Optional - Default: `snow`) - Use `snow` to show the Toolbar on top of the editor, and `bubble` for inline editing.
- `DebugLevel` (Optional - Default: `info`) - Determines the level of debug information returned to the web browser console window. Options are `error`, `warn`, `log`, or `info`.

**Methods**

- `GetText` - Gets the content of the editor as Text.
- `GetHTML` - Gets the content of the editor as HTML.
- `GetContent` - Gets the content of the editor in the native Quill JSON Delta format.
- `LoadContent` (`json`) - Allows the content of the editor to be programmatically set.
- `LoadHTMLContent` (`string`) - Allows the content of the editor to be programmatically set.
- `InsertImage` (`string`) - Inserts an image at the current point in the editor.


### Basic Example
Compared to the original project, this fork implements a much simpler way to use the component.

```cs
@using WYSIWYGTextEditor
<TextEditor Toolbar="new Toolbar { ShowFullToolbar=true }" EditorContainerId="TestId" @ref="@MyEditor"
                    Placeholder="Enter non HTML format like centering...">
</TextEditor>
@code { 
	TextEditor MyEditor;
}

```

However, should you wish to for some reason, you can still use the component in the old, more verbose way.

```cs
@using WYSIWYGTextEditor

<TextEditor @ref="@QuillHtml">
    <ToolbarContent>
        <select class="ql-header">
            <option selected=""></option>
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value="4"></option>
            <option value="5"></option>
        </select>
        <span class="ql-formats">
            <button class="ql-bold"></button>
            <button class="ql-italic"></button>
            <button class="ql-underline"></button>
            <button class="ql-strike"></button>
        </span>
        <span class="ql-formats">
            <select class="ql-color"></select>
            <select class="ql-background"></select>
        </span>
        <span class="ql-formats">
            <button class="ql-list" value="ordered"></button>
            <button class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
            <button class="ql-link"></button>
        </span>
    </ToolbarContent>
    <EditorContent>
        <h4>This Toolbar works with HTML</h4>
        <a href="http://BlazorHelpWebsite.com">
        BlazorHelpWebsite.com</a>
    </EditorContent>
</TextEditor>
<br />
<button class="btn btn-primary" 
        @onclick="GetHTML">Get HTML</button>
<button class="btn btn-primary"
        @onclick="SetHTML">Set HTML</button>
<br />
<div>
    <br />
    @((MarkupString)QuillHTMLContent)
    @QuillHTMLContent
</div>
<br />

@code {

TextEditor QuillHtml;
string QuillHTMLContent;

    public async void GetHTML()
    {
        QuillHTMLContent = await this.QuillHtml.GetHTML();
        StateHasChanged();
    }

    public async void SetHTML()
    {
        string QuillContent =
            @"<a href='http://BlazorHelpWebsite.com/'>" +
            "<img src='images/BlazorHelpWebsite.gif' /></a>";

        await this.QuillHtml.LoadHTMLContent(QuillContent);
        StateHasChanged();
    }
}
```

###Add fonts
This fork also implements a simple way to add your own fonts to the editor.

```cs
@using WYSIWYGTextEditor

<style>
    /*SET THE DEFAULT FONT*/
    #TestId {
        font-family: "MS Gothic";
        font-size: 18px;
        height: 375px;
    }

    /*DEFINE ALL OF THE CUSTOM FONTS*/
    .ql-font-MSGothic {
        font-family: 'MS Gothic';
    }

    .ql-font-Bahnschrift {
        font-family: 'Bahnschrift'
    }

    .ql-font-Impact {
        font-family: 'Impact';
    }

    .ql-font-Courier {
        font-family: 'Courier';
    }

    .ql-font-Comic {
        font-family: 'Comic Sans MS';
    }
</style>

<TextEditor Toolbar="new Toolbar { ShowFullToolbar=true }" EditorContainerId="TestId" @ref="@MyEditor" Fonts="Fonts"
            Placeholder="Enter non HTML format like centering...">
</TextEditor>

@code{
    List<string> Fonts = new List<string> { "MSGothic", "Impact", "Courier", "Comic", "Bahnschrift" }; //be sure to set the default font as the first in the list
    TextEditor MyEditor;
}

```

### Import/Export in docx
Coming soon


### Rich Text Screenshot
![Screenshot](DeltaExample.png)
### Read Only Screenshot
![Screenshot](InlineEditingExample.png)
