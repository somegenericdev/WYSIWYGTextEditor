# Penman.Blazor.Quill TextEditor
Penman.Blazor.Quill Rich Text Editor for Blazor applications - Built on top of [Quill JS](https://quilljs.com/ "Quill JS.com")

![Screenshot](https://raw.githubusercontent.com/domingoladron/Penman.Blazor.Quill/main/Screenshot.png)


### Installing

You can install from NuGet using the following command:

`Install-Package Penman.Blazor.Quill`

Or via the Visual Studio package manger.

### Setup


### Add PenmanQuill to your service collection
Add a reference to the PenmanQuill services to your Program.cs (Wasm) or Startup.cs (Server)

#### **Blazor Server Startup**
```cs
 public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
            services.AddServerSideBlazor().AddCircuitOptions(options => { 
                options.DetailedErrors = true; 
            });
            
            services.AddPenmanQuill(); //<-- add this
        }
```

#### **Blazor Wasm Program**

```cs
    builder.Services.AddPenmanQuill();
```


#### Add CSS and Javascript to your Blazor site
Add the following CSS files to `_Host.cshtml` if you're using Blazor Server or to `index.html` if you're using Blazor WASM

```html
    <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
    <link href="//cdn.quilljs.com/1.3.6/quill.bubble.css" rel="stylesheet" />
    <link href="_content/Penman.Blazor.Quill/penman-blazor-quill.css" rel="stylesheet" />
```
And then do the same with the Javascript files

```html
    <script src="_content/Penman.Blazor.Quill/quill-blot-formatter.min.js"></script>
    <script src="_content/Penman.Blazor.Quill/penman-blazor-quill.js"></script>
```

Optional:  If you don't want to keep adding the namespace to pages, just add the following using statement to `_Imports.razor`.

```cs
@using Penman.Blazor.Quill
```



## Usage


### Setting a Quill Theme

Penman.Blazor.Quill supports the two primary Quill Themes

* Snow (default)
* Bubble (more of a Medium-style pop-up toolbar experience)

In order to set the theme, do the following

```cs
<TextEditor @ref="@_quillEditor" 
            Theme="EditorTheme.Bubble">
</TextEditor>
```

### Default Toolbar Example
Building the toolbar is easy.  You can state what you wish by passing in the Toolbar object.

```cs
@using Penman.Blazor.Quill
<TextEditor 
    Toolbar="new Toolbar { ShowFullToolbar=true }"
    @ref="@MyEditor"
    Placeholder="Enter non HTML format like centering...">
</TextEditor>
@code { 
	TextEditor MyEditor;
}

```

Or you can specify the very toolbar elements you want to use.

```cs
@using Penman.Blazor.Quill

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

### Add fonts
You can add your own fonts to the editor.

```cs
@using Penman.Blazor.Quill

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

## Penman.Blazor.Quill is auto-growing by default
You need only style the height of the editor's parent div ```#ql-editor-container``` to an appropriate height, 
and the editor will automatically fill to the size you've specified.  
    
**Neat!**
    
```css
    #ql-editor-container {
    height: 500px;
    }
```

# Advanced functionality

## Sticky Snow Toolbar

On longer documents, it becomes tedious and unusable to have the snow toolbar lodged up the top, so instead you can configure the snow editor to have the toolbar follow along as you edit.  Simply pass the EditorTheme.Snow for the Theme and StickyToolBar="true"
> Note: The bubble editor is not impacted by this at all

```
<TextEditor @ref="@_quillHtml" 
            Theme="EditorTheme.Snow"
            StickyToolBar="true">
            ...

```

## Quill Server-Uploaded Images

Quill natively uploads images as 64bit encoded embedded images. This is fine in most situations, but for some scenarios, having the image file uploaded like this is unacceptable.

You might want to upload the image to a separate server or API, or even process the file inside your Blazor page.  Quill Server-Uploaded Images support the image upload button and drag-and-drop image uploads.

Penman.Blazor.Quill supports two modes for handling server-side image processing.

* **ImageServerUploadType.ApiPost** Have javascript perform a fetch POST of the image data to a given url.
* **ImageServerUploadType.BlazorMethod** Have javascript send the image data to a delegated Function inside your Blazor page so you can process it yourself.

### ImageServerUploadType.ApiPost

You can configure API Posting by setting up the TextEditor like this:

```cs
<TextEditor @ref="@_quillHtml"
            ImageServerUploadEnabled="true" 
            ImageServerUploadType="ImageServerUploadType.ApiPost" 
            ImageServerUploadUrl="http://some-url-to-post-image">
</TextEditor>

```

A fetch POST will be called, passing the image as formData attached to the 'imageFile' parameter
```javascript
const formData = new FormData();
.append('imageFile', file);
```

It's expected that the configured ```ImageServerUploadUrl``` will -- afer processing the image -- return a URL (string) of the image's saved location so Penman.Blazor.Quill can display this in the TextEditor.

> Note:  For security reasons, Penman.Blazor.Quill passes no http headers of any kind, so if your ```ImageServerUploadUrl``` requires such headers, it's recommended that you use a proxy server to receive such a request and add the required headers from the POST before passing it along to the actual image processing server.

### ImageServerUploadType.BlazorMethod
You can configure Blazor method uploading in your page by configuring your TextEditor as so:

```cs
<TextEditor @ref="@_quillHtml"
            ImageServerUploadEnabled="true" 
            ImageServerUploadType="ImageServerUploadType.BlazorMethod" 
            ImageServerUploadMethod="UploadImageToBlazor"
            >
</TextEditor>

```

Where ```UploadImageToBlazor``` is a Func delegate of type ```Func<string, string, Stream, Task<string>> ```

#### Example

````cs

private async Task<string> UploadImageToBlazor(string imageName, string imageContentType, Stream imageData)
    {
        //process the image stream and return a string to its url on the interwebs
    }

````

If you want to try out the server-uploaded functionality, have a look at the [samples](samples/README.md)

