import { ImageUploader } from 'quill.imageUploader.js';

(
    function () {
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
            customFonts) {

            var modulesToLoad = {
                toolbar: toolBar,
                blotFormatter: {}
            };

            if (imageServerUploadEnabled) {
                //Quill.register("modules/imageUploader", ImageUploader);

                //modulesToLoad["imageUploader"] = {
                //    upload: (file) => {
                //        //todo:  make this fucker do something
                //    }
                //}
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
})();