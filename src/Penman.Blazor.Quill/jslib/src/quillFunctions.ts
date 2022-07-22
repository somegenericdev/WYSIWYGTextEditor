import * as QuillNamespace from 'quill';
let Quill: any = QuillNamespace;

import BlotFormatter from 'quill-blot-formatter';
import {BlockBlot} from "parchment";

let InlineBlot : BlockBlot  = Quill.import("blots/block");
//
export class LoadingImage extends BlockBlot {
    private cache: {};
    static create(src: string) {
        const node = super.create(src);
        if (src != null) {
            const image = document.createElement('img');
            image.setAttribute('src', src);
            node.appendChild(image);
            return node;
        } else {
            return node;
        }
    }
    deleteAt(index: any, length: any) {
        super.deleteAt(index, length);
        this.cache = {};
    }
    static value(domNode: { dataset: { src: any; custom: any; }; }) {
        const { src, custom } = domNode.dataset;
        return { src, custom };
    }
}

LoadingImage.blotName = "imageBlot";
LoadingImage.className = "image-uploading";
LoadingImage.tagName = "span";


export class ImageUploader {
    private quill: QuillNamespace.Quill;
    private options: any;
    private range: QuillNamespace.RangeStatic;
    private fileHolder: HTMLInputElement;
    constructor(quill : QuillNamespace.Quill, options: any) {
        this.quill = quill;
        this.options = options;
        this.range = null;

        if (typeof this.options.upload !== "function")
            console.warn(
                "[Missing config] upload function that returns a promise is required"
            );

        const toolbar = this.quill.getModule('toolbar');
        toolbar.addHandler("image", this.selectLocalImage.bind(this));

        this.handleDrop = this.handleDrop.bind(this);
        this.handlePaste = this.handlePaste.bind(this);

        this.quill.root.addEventListener("drop", this.handleDrop, false);
        this.quill.root.addEventListener("paste", this.handlePaste, false);
    }

    selectLocalImage() {
        this.range = this.quill.getSelection();
        this.fileHolder = document.createElement("input");
        this.fileHolder.setAttribute("type", "file");
        this.fileHolder.setAttribute("accept", "image/*");
        this.fileHolder.setAttribute("style", "visibility:hidden");

        this.fileHolder.onchange = this.fileChanged.bind(this);

        document.body.appendChild(this.fileHolder);

        this.fileHolder.click();

        window.requestAnimationFrame(() => {
            document.body.removeChild(this.fileHolder);
        });
    }

    handleDrop(evt: any) {
        evt.stopPropagation();
        evt.preventDefault();
        if (
            evt.dataTransfer &&
            evt.dataTransfer.files &&
            evt.dataTransfer.files.length
        ) {
            if (document.caretRangeFromPoint) {
                const selection = document.getSelection();
                const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
                if (selection && range) {
                    selection.setBaseAndExtent(
                        range.startContainer,
                        range.startOffset,
                        range.startContainer,
                        range.startOffset
                    );
                }
            } else {
                const selection = document.getSelection();
                // @ts-ignore
                const range = document.caretPositionFromPoint(evt.clientX, evt.clientY);
                if (selection && range) {
                    selection.setBaseAndExtent(
                        range.offsetNode,
                        range.offset,
                        range.offsetNode,
                        range.offset
                    );
                }
            }

            this.range = this.quill.getSelection();
            let file = evt.dataTransfer.files[0];

            setTimeout(() => {
                this.range = this.quill.getSelection();
                this.readAndUploadFile(file);
            }, 0);
        }
    }

    handlePaste(evt: { clipboardData: any; preventDefault: () => void; }) {
        let clipboard = evt.clipboardData;

        // IE 11 is .files other browsers are .items
        if (clipboard && (clipboard.items || clipboard.files)) {
            let items = clipboard.items || clipboard.files;
            const IMAGE_MIME_REGEX = /^image\/(jpe?g|gif|png|svg|webp)$/i;

            for (let i = 0; i < items.length; i++) {
                if (IMAGE_MIME_REGEX.test(items[i].type)) {
                    let file = items[i].getAsFile ? items[i].getAsFile() : items[i];

                    if (file) {
                        this.range = this.quill.getSelection();
                        evt.preventDefault();
                        setTimeout(() => {
                            this.range = this.quill.getSelection();
                            this.readAndUploadFile(file);
                        }, 0);
                    }
                }
            }
        }
    }

    readAndUploadFile(file: File) {
        let isUploadReject = false;

        const fileReader = new FileReader();

        fileReader.addEventListener(
            "load",
            () => {
                if (!isUploadReject) {
                    let base64ImageSrc = fileReader.result;
                    this.insertBase64Image(base64ImageSrc);
                }
            },
            false
        );

        if (file) {
            fileReader.readAsDataURL(file);
        }

        this.options.upload(file).then(
            (imageUrl : string) => {
                this.insertToEditor(imageUrl);
            },
            (error: any) => {
                isUploadReject = true;
                this.removeBase64Image();
                console.warn(error);
            }
        );
    }

    fileChanged() {
        const file = this.fileHolder.files[0];
        this.readAndUploadFile(file);
    }

    insertBase64Image(url: string | ArrayBuffer) {
        const range = this.range;
        this.quill.insertEmbed(
            range.index,
            LoadingImage.blotName,
            `${url}`,
            "user"
        );
    }

    insertToEditor(url : string) {
        const range = this.range;
        // Delete the placeholder image
        this.quill.deleteText(range.index, 3, "user");
        // Insert the server saved image
        this.quill.insertEmbed(range.index, "image", `${url}`, "user");

        range.index++;
        this.quill.setSelection(range, "user");
    }

    removeBase64Image() {
        const range = this.range;
        this.quill.deleteText(range.index, 3, "user");
    }
}

(window as any).ImageUploader = ImageUploader;




export namespace QuillFunctions
{
    export function createQuill(
        quillElement: HTMLElement,
        toolBar : HTMLElement,
        readOnly : boolean,
        placeholder : string,
        theme : string,
        debugLevel : string,
        editorContainerId : string,
        imageServerUploadEnabled : boolean,
        imageServerUploadType : string,
        imageServerUploadUrl : string,
        customFonts : Array<string>)
    {

        let modulesToLoad = {
            toolbar: toolBar,
            blotFormatter: {}
        };

        let modulesToLoadWithImageUploader = {
            toolbar: toolBar,
            blotFormatter: {},
            imageUploader: {}
        };


        if (imageServerUploadEnabled) {
            Quill.register("modules/imageUploader", ImageUploader);
            Quill.register({ "formats/imageBlot": LoadingImage });
            modulesToLoadWithImageUploader["imageUploader"] = {
                upload: (file : File) => {

                    const fileReader = new FileReader();
                    return new Promise((resolve, reject) => {
                        fileReader.addEventListener(
                                "load",
                                () => {
                                    setTimeout(() => {
                                        const fileHolder = {
                                            base64ImageSrc: fileReader.result
                                        }
                                        const formData = new FormData();
                                        formData.append('imageFile', file);
                                        switch (imageServerUploadType) {
                                            case  ImageServerUploadType.BlazorMethod.toString():
                                                window.quillImageDataStream = function () {
                                                    return fileHolder.base64ImageSrc;
                                                };
                                                window.quillBlazorBridge.invokeMethodAsync('SaveImage',
                                                    file.name,
                                                    file.type)
                                                    .then((result: string) => {
                                                        resolve(result);
                                                    })
                                                    .catch((failure: any) => {
                                                        fileHolder.base64ImageSrc = null;
                                                        reject();
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
                                                    }).catch((failure: any) => {
                                                    fileHolder.base64ImageSrc = null;
                                                    reject();
                                                });
                                        }

                                    }, 1500);

                                }, false);

                    })
                }
            }


        }
        Quill.register('modules/blotFormatter', BlotFormatter);

        //load up our custom fonts
        if (customFonts != null && customFonts.length > 0) {
            const fontRegistry = Quill.import('formats/font');
            fontRegistry.whitelist = customFonts;
            Quill.register(fontRegistry, true);
        }

        //finally let's create and return our quill node
        const options = {
            debug: debugLevel,
            modules: (imageServerUploadEnabled)? modulesToLoadWithImageUploader : modulesToLoad,
            scrollingContainer: editorContainerId,
            placeholder: placeholder,
            readOnly: readOnly,
            theme: theme
        };
        let quill = new Quill(quillElement, options);

        quill.on('text-change', function(delta: any, oldDelta: any, source: string) {
            window.quillBlazorBridge.invokeMethodAsync('FireTextChangedEvent');
        });
    }


    export function getQuillContent(quillElement : QuillNamespace.Quill) {
        return JSON.stringify(quillElement.getContents());
    }

    export function  getQuillText(quillElement : QuillNamespace.Quill) {
        return quillElement.getText();
    }

    export function getQuillHTML(quillElement : QuillNamespace.Quill) {
        return quillElement.root.innerHTML;
    }

    export function loadQuillContent(quillElement : QuillNamespace.Quill, quillContent: string) {
        let content = JSON.parse(quillContent);
        return quillElement.setContents(content, 'api');
    }

    export function loadQuillHTMLContent(quillElement : QuillNamespace.Quill, quillHTMLContent: any) {
        return quillElement.root.innerHTML = quillHTMLContent;
    }

    export function enableQuillEditor(quillElement : QuillNamespace.Quill, mode: boolean) {
        quillElement.enable(mode);
    }

    export function insertQuillImage(quillElement : QuillNamespace.Quill, imageURL: any) {
        let Delta = Quill.import('delta');
        let editorIndex;
        editorIndex = 0;

        if (quillElement.getSelection() !== null) {
            editorIndex = quillElement.getSelection().index;
        }

        return quillElement.updateContents(
            new Delta()
                .retain(editorIndex)
                .insert({ image: imageURL },
                    { alt: imageURL }));
    }

    export function configureStickyToolbar(toolbarElement: HTMLElement) {

        window.onscroll = function (e) {
            let verticalPosition = 0;
            if (document.documentElement.clientHeight) //ie
                verticalPosition = document.documentElement.scrollTop;
            else if (document.body) //ie quirks
                verticalPosition = document.body.scrollTop;
            const toolbarDiv = toolbarElement;
            if (verticalPosition > 200) {
                const scrollDiff = verticalPosition - 200;
                toolbarDiv.style.top = (verticalPosition - scrollDiff) + 'px';
            } else {
                toolbarDiv.style.top = (verticalPosition) + 'px';
            }
        }
    }

    export function setQuillBlazorBridge(quillBlazorBridge : any) {
        window.quillBlazorBridge = quillBlazorBridge;
    }

    export enum ImageServerUploadType {
        /// <summary>
        /// An API Post method, where you provide a url where you'd like
        /// Penman.Blazor.Quill to post the IFormFile image data.
        /// Particularly useful if you have an API for storing / retrieving images
        /// Choosing this value, you will need to provide the ImageServerUploadUrl on your TextEditor
        /// to which the data will be posted
        /// </summary>
        ApiPost,
        /// <summary>
        /// A specified Func<string, string, byte[], out string> ImageServerUploadMethod which
        /// you specify on the TextEditor parameters and implement in our own Blazor code.
        /// You will need to provide an implementation of the ImageServerUploadMethod on your TextEditor
        /// so the image data can be sent to your blazor page / component
        /// </summary>
        BlazorMethod
    }
}


