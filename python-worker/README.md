# Python Worker - PowerPoint Creation Service

This is a Cloudflare Python Worker that creates PowerPoint presentations using the python-pptx library.

## What This Does

Receives JSON requests with presentation specifications and returns a .pptx file.

## API

### POST (any path)

**Request Body:**
```json
{
  "title": "Presentation Name",
  "slides": [
    {
      "layout": "title",
      "title": "Title Slide"
    },
    {
      "layout": "title_and_content",
      "title": "Content Slide",
      "bullets": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}
```

**Response:**
- PowerPoint file (.pptx) as binary data
- Content-Type: `application/vnd.openxmlformats-officedocument.presentationml.presentation`

## Slide Layouts

- `"title"` - Title slide (slide_layouts[0])
- `"title_and_content"` - Title with bullet points (slide_layouts[1])
- `"blank"` - Blank slide (slide_layouts[6])

## Local Development

```bash
wrangler dev --port 8788
```

## Deployment

```bash
wrangler deploy
```

This deploys as: `mcp-presentations-python`

## Dependencies

- python-pptx 1.0.2 (specified in requirements.txt)
