using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BlazorServerSide.Controllers
{
    [Route("images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        // GET api/<ImageUploadController>/5
        [HttpGet("")]
        public string Get()
        {
            return "value";
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
            await Task.CompletedTask;
        }

        private bool FileIsValidImageFormat(IFormFile imageFile)
        {
            return true;
        }


        // DELETE api/<ImageUploadController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
