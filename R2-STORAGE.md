# R2 Storage for Presentations

This MCP server now stores generated PowerPoint presentations in Cloudflare R2 storage and provides URLs to download the binary files.

## Features

### 1. Automatic R2 Storage
When you create a presentation using the `create_presentation` tool, the generated PPTX file is automatically stored in R2 with:
- Unique filename with timestamp
- HTTP metadata (content type)
- Custom metadata (original title, creation date, slide count)

### 2. New Tools

#### `get_presentation_url`
Retrieves the download URL and metadata for a stored presentation.

**Parameters:**
- `filename` (string): The filename of the stored presentation

**Returns:**
- Filename
- Original title
- Creation date
- Number of slides
- File size in KB
- Download URL

**Example:**
```json
{
  "filename": "My_Presentation_1732567890123.pptx"
}
```

#### `list_presentations`
Lists all stored presentations with their metadata and download URLs.

**Parameters:**
- `limit` (number, optional): Maximum number of presentations to list (default: 10)

**Returns:**
- List of presentations with:
  - Original title
  - Filename
  - Creation date
  - File size
  - Number of slides
  - Download URL

**Example:**
```json
{
  "limit": 20
}
```

### 3. Direct R2 Access

Presentations are accessible directly via the R2 public bucket URL:
```
https://pub-cf644c6898c249269604aa5406c2dacc.r2.dev/{filename}
```

Benefits:
- Direct access to files without going through the worker
- Leverages Cloudflare's global CDN for fast downloads
- No additional processing or bandwidth costs on the worker
- Standard HTTP caching works automatically

## Configuration

### R2 Bucket Setup

1. Create an R2 bucket in your Cloudflare account:
```bash
wrangler r2 bucket create mcp-presentations
```

2. Enable public access on your R2 bucket to get a public URL:
   - Go to Cloudflare Dashboard → R2
   - Select your `mcp-presentations` bucket
   - Go to Settings → Public Access
   - Enable "Allow Access" to get a public URL like: `https://pub-xxxxxx.r2.dev`

3. The bucket binding is already configured in `wrangler.jsonc`:
```jsonc
"r2_buckets": [
  {
    "binding": "PRESENTATIONS",
    "bucket_name": "mcp-presentations"
  }
]
```

4. Update the `R2_PUBLIC_URL` variable in `wrangler.jsonc`:
```jsonc
"vars": {
  "R2_PUBLIC_URL": "https://pub-cf644c6898c249269604aa5406c2dacc.r2.dev"
}
```

Replace with your actual R2 public bucket URL from step 2.

## Usage Example

1. **Create a presentation:**
```json
{
  "tool": "create_presentation",
  "arguments": {
    "title": "My Amazing Presentation",
    "slides": [
      {
        "layout": "title",
        "title": "Welcome to My Presentation"
      },
      {
        "layout": "title_and_content",
        "title": "Key Points",
        "bullets": ["Point 1", "Point 2", "Point 3"]
      }
    ]
  }
}
```

**Response includes:**
- Confirmation message
- File size
- Unique filename
- Download URL

2. **Get presentation URL later:**
```json
{
  "tool": "get_presentation_url",
  "arguments": {
    "filename": "My_Amazing_Presentation_1732567890123.pptx"
  }
}
```

3. **List all presentations:**
```json
{
  "tool": "list_presentations",
  "arguments": {
    "limit": 10
  }
}
```

## Development

### Local Development
During local development with `wrangler dev`, files are stored in local R2 storage. The R2_PUBLIC_URL points to your production bucket.

### Production Deployment
1. Ensure your R2 bucket has public access enabled
2. Update `R2_PUBLIC_URL` in `wrangler.jsonc` to your R2 public URL
3. Deploy: `wrangler deploy`

**Important:** Files created during local development are stored locally and won't be accessible via the public URL. Only files created after deploying to production will be accessible via the public R2 URL.

## File Naming
Files are stored with sanitized names and timestamps:
```
Original: "My Presentation!"
Stored as: "My_Presentation_1732567890123.pptx"
```

This ensures:
- URL-safe filenames
- Unique identifiers (timestamp)
- No filename conflicts

## Metadata Storage
Each file stores custom metadata:
- `originalTitle`: The presentation title as provided
- `createdAt`: ISO timestamp of creation
- `slideCount`: Number of slides in the presentation

This metadata is available when listing or retrieving presentations without downloading the entire file.
