using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BlazorServerSide.Controllers
{
    /// <summary>
    /// An example API Controller for dealing with the files coming into a Blazor server app
    /// </summary>
    [Route("images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        // GET api/<ImageUploadController>/5
        [HttpGet("{imageName}")]
        public async Task<IActionResult> Get(string imageName)
        {
            var imagePath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "img", imageName);

            if (!System.IO.File.Exists(imagePath))
                return NotFound(); // returns a NotFoundResult with Status404NotFound response.

            var stream = System.IO.File.OpenRead(imagePath);
            return File(stream, "application/octet-stream");
        }

        // POST api/<ImageUploadController>
        [HttpPost, DisableRequestSizeLimit]
        public async Task<IActionResult> PostAsync(IFormFile imageFile)
        {
            if (FileIsValidImageFormat(imageFile))
            {
                await SaveFileAsync(imageFile);
            }
            else
            {
                return BadRequest(new { message = "Invalid file extension" });
            }

            return Ok($"/images/{imageFile.FileName}");
        }

        private async Task SaveFileAsync(IFormFile imageFile)
        {
            var imagePath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "img", imageFile.FileName);
            var createdFile = System.IO.File.Create(imagePath);
            await imageFile.CopyToAsync(createdFile);
            createdFile.Close();
            await Task.CompletedTask;
        }

        private bool FileIsValidImageFormat(IFormFile imageFile)
        {
            return true;
        }
    }
}
