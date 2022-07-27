(
    function () {

        const InlineBlot = Quill.import("blots/block");

        class LoadingImage extends InlineBlot {
            static create(src) {
                const node = super.create(src);
                if (src === true) return node;

                const image = document.createElement("img");
                image.setAttribute("src", src);
                node.appendChild(image);
                return node;
            }
            deleteAt(index, length) {
                super.deleteAt(index, length);
                this.cache = {};
            }
            static value(domNode) {
                const { src, custom } = domNode.dataset;
                return { src, custom };
            }
        }

        LoadingImage.blotName = "imageBlot";
        LoadingImage.className = "image-uploading";
        LoadingImage.tagName = "span";
        
          
        class ImageUploader {
            constructor(quill, options) {
                this.quill = quill;
                this.options = options;
                this.range = null;

                if (typeof this.options.upload !== "function")
                    console.warn(
                        "[Missing config] upload function that returns a promise is required"
                    );

                var toolbar = this.quill.getModule("toolbar");
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

            handleDrop(evt) {
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

            handlePaste(evt) {
                let clipboard = evt.clipboardData || window.clipboardData;

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

            readAndUploadFile(file) {
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
                    (imageUrl) => {
                        this.insertToEditor(imageUrl);
                    },
                    (error) => {
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

            insertBase64Image(url) {
                const range = this.range;
                this.quill.insertEmbed(
                    range.index,
                    LoadingImage.blotName,
                    `${url}`,
                    "user"
                );
            }

            insertToEditor(url) {
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
        window.ImageUploader = ImageUploader;


        /** QuillBlazorBridge acts as a communications protocol between javascript and blazor c# logic in reln to Quill JS.
         *  It's particularly concerned with passing data about how the quill element's saving of text or image content
         *  is handled.
         **/
        class QuillBlazorBridge {
            constructor(quillElement, blazorHook, postFileTextUrl, statusDisplayElement) {
                this.quillElement = quillElement;
                this.blazorHook = blazorHook;
                this.postFileTextUrl = postFileTextUrl;
                this.statusDisplayElement = statusDisplayElement;
            }


            //timer guff
            static typingTimer;                //timer identifier for when user stops typing
            static doneTypingInterval = 1000;  //time in ms to delay after quill activity to save
            static delayBetweenStatusMessages = 2000; ///time in ms to delay between status messages

            /**
             * Call back on Blazor with the details of the image to save.
             * @param {any} fileName
             * @param {any} fileType
             */
            fireImageUploadCallbackToBlazorMethod(fileName, fileType) {
                return this.blazorHook.invokeMethodAsync('SaveImage',
                    fileName,
                    fileType);
            }

            /**
             * Given quillElement, gets the html stored inside of it.
             * @param {any} quillElement The element containing quill
             */
            getQuillHTML(quillElement) {
                return this.quillElement.__quill.root.innerHTML;
            }

            /**
             * Using an element id reference passed in constructor, we attempt to set status messages
             * as various actions take place on the Quill JS instance running on the page.  This ensures
             * we aren't making calls in Blazor server code but instead just using Javascript to set the text 
             * on the status element as changes occur.
             * @param {any} statusMessage The status message to display
             */
            setStatus(statusMessage) {
                var elementId = this.statusDisplayElement;
                if (elementId != null) { 
                    var elementFound = document.getElementById(elementId);
                    if (elementFound != null) {
                        //TODO: Make the status message showing more fluid
                        setTimeout(() => { elementFound.innerText = statusMessage; }, QuillBlazorBridge.delayBetweenStatusMessages);
                    }
                   
                }
            }

            saveQuillContentsToApi() {
                this.blazorHook.invokeMethodAsync('FireTextChangedEvent');
                this.setStatus("saving...");
                const pageContents = this.getQuillHTML();

                const postUrl = this.postFileTextUrl;

                window.fetch(postUrl,
                    {
                        method: 'POST',
                        headers: {
                        },
                        body: pageContents
                    })
                    .then(response => {
                        if (response.status === 200) {
                            this.blazorHook.invokeMethodAsync('FireTextChangedEvent');
                            this.setStatus("saved");
                        } else {
                            this.setStatus("Failed to save content.");

                        }
                    });
                }
        }

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

                const modulesToLoad = {
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
                                                    if(window.quillBlazorBridge != null) {
                                                        window.quillBlazorBridge.fireImageUploadCallbackToBlazorMethod(
                                                            file.name,
                                                            file.type)
                                                            .then(result => {
                                                                resolve(result);
                                                            });
                                                    }
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
                let quill = new Quill(quillElement, options);
                
            },

            getQuillContent: function (quillElement) {
                return JSON.stringify(quillElement.__quill.getContents());
            },

            getQuillText: function (quillElement) {
                return quillElement.__quill.getText();
            },

            getQuillHTML: function (quillElement) {
                return quillElement.__quill.root.innerHTML;
            },

            loadQuillContent: function (quillElement, quillContent) {
                content = JSON.parse(quillContent);
                return quillElement.__quill.setContents(content, 'api');

                //if (window.quillBlazorBridge != null) {
                //    window.quillBlazorBridge.setStatus('Loaded');
                //}
            },

            loadQuillHTMLContent: function (quillElement, quillHTMLContent) {
                const delta = quillElement.__quill.clipboard.convert(quillHTMLContent)
                quillElement.__quill.setContents(delta, 'silent');

                //if (window.quillBlazorBridge != null) {
                //    window.quillBlazorBridge.setStatus('Loaded');
                //}
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
            },
            
            setQuillBlazorBridge: function (quillElement, blazorHook, postFileTextUrl, statusDisplayElement) {    
                window.quillBlazorBridge = new QuillBlazorBridge(quillElement, blazorHook, postFileTextUrl, statusDisplayElement);
               
                quillElement.__quill.on('text-change', window.QuillFunctions.quillTextChangedHandler);
            },

            unBindToQuillTextChangeEvent: function (quillElement) {
                if (quillElement != null && quillElement.__quill != null) {
                    quillElement.__quill.off('text-change', window.QuillFunctions.quillTextChangedHandler);
                }
            }, 

            setTextSavePostUrl: function (textSavePostUrl) {
                if (window.quillBlazorBridge != null) {
                    window.quillBlazorBridge.postFileTextUrl = textSavePostUrl;
                }
            },

            quillTextChangedHandler: function (delta, oldDelta, source) {
                 if (source == 'user') {
                     clearTimeout(QuillBlazorBridge.typingTimer);
                     QuillBlazorBridge.typingTimer = setTimeout(saveContentsToApi, QuillBlazorBridge.doneTypingInterval);
                 }

                 function saveContentsToApi() {
                     window.quillBlazorBridge.saveQuillContentsToApi();
                 }
            }
        };
    })();