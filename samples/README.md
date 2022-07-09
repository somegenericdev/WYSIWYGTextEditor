# How to use the samples

The samples are designed to be self-contained docker-compose solution, especially useful for testing the server image upload functionality.


## What's in here?

There are 3 projects:

* **BlazorWasm** A Blazor WASM app using the Penman.Blazor.Quill library.  It contains pages for trying out the quill server image upload functionality.  This runs on your workstations on ```http://localhost:54113```
* **BlazorServer** A Blazor Server app using the Penman.Blazor.Quill library.  It contains pages for trying out the quill server image upload functionality.  This runs on your workstations on ```http://localhost:54112```
* **SampleImageApi** A stupidly simple API with one controller for POST and GET ```/images/```.  This is the API which will be called by both the WASM and Server versions to upload images inserted into Penman.Blazor.Quill TextEditor.  This runs on your workstations on ```http://localhost:54111```



## How to run the samples?
You'll need to run these from a docker-compose command prompt.

1. Navigate to the root of this repo
2. Run ```docker-compose build```
3. Run ```docker-compose up```

### To try the Blazor WASM functionality
Navigate to  ```http://localhost:54113``` and upload an image in the TextEditor in either the **Image upload to server** or the **Image upload to blazor** example pages.

### To try the Blazor Server functionality
Navigate to  ```http://localhost:54112``` and upload an image in the TextEditor in either the **Image upload to server** or the **Image upload to blazor** example pages.

## What should I see?
If you look in the docker-compose output, you'll see the following style lines coming from the SampleImageApi as you upload files to either of the sample Blazor apps

```
image-api            | info: SampleImageApi.Controllers.ImagesController[0]
image-api            |       Inbound image file: some-image-you-uploaded.png, Content-Type: image/png
image-api            | info: SampleImageApi.Controllers.ImagesController[0]
image-api            |       Writing image file: some-image-you-uploaded.png to /app/wwwroot/img/some-image-you-uploaded.png

```
