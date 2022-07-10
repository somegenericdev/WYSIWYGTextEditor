using System.Collections;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Mvc;

namespace SampleImageApi.Controllers
{
    /// <summary>
    /// An example API Controller for dealing with the quill image files coming into a Blazor app
    /// </summary>
    [Route("images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IHttpContextAccessor _context;
        private readonly ILogger _logger;

        public ImagesController(IHttpContextAccessor context, ILogger<ImagesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("")]
        public async Task<IActionResult> Get()
        {
            return Ok("test");
        }


        [HttpGet("{imageName}")]
        public async Task<IActionResult> Get(string imageName)
        {
            var imagePath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "img", imageName);

            if (!System.IO.File.Exists(imagePath))
                return NotFound(); // returns a NotFoundResult with Status404NotFound response.

            var stream = System.IO.File.OpenRead(imagePath);
            return File(stream, "application/octet-stream");
        }

        [HttpPost, DisableRequestSizeLimit]
        public async Task<IActionResult> PostAsync(IFormFile imageFile)
        {
            _logger.LogInformation($"Inbound image file: {imageFile.FileName}, Content-Type: {imageFile.ContentType}");
            if (FileIsValidImageFormat(imageFile))
            {
                await SaveFileAsync(imageFile);
            }
            else
            {
                return BadRequest(new { message = "Invalid file extension" });
            }

            var request = _context.HttpContext?.Request;
            var appBaseUrl = $"http://localhost:54111";
            return Ok($"{appBaseUrl}/images/{imageFile.FileName}");
        }

        private async Task SaveFileAsync(IFormFile imageFile)
        {
            var imagePath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "img", imageFile.FileName);

            _logger.LogInformation($"Writing image file: {imageFile.FileName} to {imagePath}");

            var createdFile = System.IO.File.Create(imagePath);
            await imageFile.CopyToAsync(createdFile);
            createdFile.Close();
            await Task.CompletedTask;
        }

        private bool FileIsValidImageFormat(IFormFile imageFile)
        {
            var acceptedImageTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp" };

            return ((IList)acceptedImageTypes).Contains(imageFile.ContentType);
        }
    }
}
