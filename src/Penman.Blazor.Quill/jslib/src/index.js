import Quill from "quill";
import { ImageUploader, LoadingImage } from "./ImageUploader";

window.QuillFunctions = {        
    createQuill: function (
        quillElement,
        toolBar,
        readOnly,
        placeholder,
        theme,
        debugLevel,
        editorContainerId,
        imageServerUploadEnabled,
        imageServerUploadType,
        imageServerUploadUrl,
        customFonts) {

        var modulesToLoad = {
            toolbar: toolBar,
            blotFormatter: {}
        };

        if (imageServerUploadEnabled) {
            Quill.register("modules/imageUploader", ImageUploader);
            Quill.register({ "formats/imageBlot": LoadingImage });
            modulesToLoad["imageUploader"] = {
                upload: (file) => {
                    const fileReader = new FileReader();
                    return new Promise((resolve, reject) => {
                        fileReader.addEventListener(
                            "load",
                            () => {
                                const base64ImageSrc = new Uint8Array(fileReader.result);
                                setTimeout(() => {
                                    const formData = new FormData();
                                    formData.append('imageFile', file);
                                    switch (imageServerUploadType) {
                                        case "BlazorMethod":
                                            window.quillImageDataStream = function() {
                                                return base64ImageSrc;
                                            };
                                            window.quillImageUploadHandler.invokeMethodAsync('SaveImage',
                                                    file.name,
                                                    file.type)
                                                .then(result => {
                                                    resolve(result);
                                                });
                                        break;
                                        default:
                                            window.fetch(imageServerUploadUrl,
                                                    {
                                                        method: 'POST',
                                                        headers: {
                                                        },
                                                        body: formData
                                                    })
                                                .then(response => {
                                                    if (response.status === 200) {
                                                        const data = response.text();
                                                        resolve(data);
                                                    }
                                                });
                                    }

                                }, 1500);
                            },
                            false
                        );

                        if (file) {
                            fileReader.readAsArrayBuffer(file);
                        } else {
                            reject("No file selected");
                        }
                    });
                }
            }
        }
        Quill.register('modules/blotFormatter', QuillBlotFormatter.default);

        var options = {
            debug: debugLevel,
            modules: modulesToLoad,
            scrollingContainer: editorContainerId, 
            placeholder: placeholder,
            readOnly: readOnly,
            theme: theme
        };

        if (customFonts != null) {
            var fontAttributor = Quill.import('formats/font');
            fontAttributor.whitelist = customFonts;
            Quill.register(fontAttributor, true);

        }
        new Quill(quillElement, options);
    },
    getQuillContent: function(quillElement) {
        return JSON.stringify(quillElement.__quill.getContents());
    },
    getQuillText: function(quillElement) {
        return quillElement.__quill.getText();
    },
    getQuillHTML: function(quillElement) {
        return quillElement.__quill.root.innerHTML;
    },
    loadQuillContent: function(quillElement, quillContent) {
        content = JSON.parse(quillContent);
        return quillElement.__quill.setContents(content, 'api');
    },
    loadQuillHTMLContent: function (quillElement, quillHTMLContent) {
        return quillElement.__quill.root.innerHTML = quillHTMLContent;
    },
    enableQuillEditor: function (quillElement, mode) {
        quillElement.__quill.enable(mode);
    },
    insertQuillImage: function (quillElement, imageURL) {
        var Delta = Quill.import('delta');
        editorIndex = 0;

        if (quillElement.__quill.getSelection() !== null) {
            editorIndex = quillElement.__quill.getSelection().index;
        }

        return quillElement.__quill.updateContents(
            new Delta()
                .retain(editorIndex)
                .insert({ image: imageURL },
                    { alt: imageURL }));
    },
    configureStickyToolbar: function (toolbarElement) {
        
        window.onscroll = function(e) {
            var verticalPosition = 0;
            if (pageYOffset) //usual
                verticalPosition = pageYOffset;
            else if (document.documentElement.clientHeight) //ie
                verticalPosition = document.documentElement.scrollTop;
            else if (document.body) //ie quirks
                verticalPosition = document.body.scrollTop;
            console.log(verticalPosition);
            //var toolbarDiv = document.getElementById('toolBar');
            var toolbarDiv = toolbarElement;
            if (verticalPosition > 200) {
                var scrollDiff = verticalPosition - 200;
                toolbarDiv.style.top = (verticalPosition - scrollDiff) + 'px';
            } else {
                toolbarDiv.style.top = (verticalPosition) + 'px';
            }
        }
    }
};

window.setQuillImageUploadHelper = function(quillImageUploadHandler) {
    window.quillImageUploadHandler = quillImageUploadHandler;
};

