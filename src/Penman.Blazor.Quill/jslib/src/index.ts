import BlotFormatter from 'quill-blot-formatter';
import {QuillFunctions} from "./quillFunctions";

declare global {
    interface Window {
        quillBlazorBridge : any;
        setQuillImageUploadHelper: (any);
        quillImageDataStream: Function;
        QuillFunctions: any;
    }
}
//
window.QuillFunctions = QuillFunctions;