# PowerPoint Creation Tool - Examples

## 📝 Basic Examples

### Example 1: Simple Title Slide
```json
{
  "title": "Hello World",
  "slides": [
    {
      "layout": "title",
      "title": "My First Presentation"
    }
  ]
}
```

### Example 2: Title + Content Slides
```json
{
  "title": "Company Overview",
  "slides": [
    {
      "layout": "title",
      "title": "Welcome to Our Company"
    },
    {
      "layout": "title_and_content",
      "title": "Our Mission",
      "bullets": [
        "Deliver exceptional value",
        "Innovation at scale",
        "Customer-first approach"
      ]
    },
    {
      "layout": "title_and_content",
      "title": "Our Values",
      "bullets": [
        "Integrity",
        "Excellence",
        "Collaboration"
      ]
    }
  ]
}
```

### Example 3: Mixed Layouts
```json
{
  "title": "Product Launch",
  "slides": [
    {
      "layout": "title",
      "title": "Introducing Our New Product"
    },
    {
      "layout": "title_and_content",
      "title": "Key Features",
      "bullets": [
        "Lightning fast performance",
        "Intuitive user interface",
        "Enterprise-grade security",
        "24/7 customer support"
      ]
    },
    {
      "layout": "blank",
      "title": "Demo Time"
    },
    {
      "layout": "title_and_content",
      "title": "Pricing",
      "bullets": [
        "Starter: $9/month",
        "Professional: $29/month",
        "Enterprise: Custom pricing"
      ]
    },
    {
      "layout": "title",
      "title": "Thank You!"
    }
  ]
}
```

## 🤖 AI Prompts for Claude/ChatGPT

### Prompt 1: Meeting Summary
```
Create a presentation summarizing our Q4 planning meeting with these key points:
- Budget approved: $500K
- New hires: 3 engineers
- Launch date: March 2026
- Priority features: mobile app, API v2, analytics dashboard
```

### Prompt 2: Educational Content
```
Create a 5-slide presentation teaching beginners about machine learning:
- Title slide
- What is ML?
- Types of ML (supervised, unsupervised, reinforcement)
- Common applications
- Getting started resources
```

### Prompt 3: Sales Pitch
```
Create a sales presentation for our SaaS product:
- Problem: Managing remote teams is hard
- Solution: Our collaboration platform
- Benefits: Better communication, increased productivity, lower costs
- Features: Video calls, project management, time tracking
- Pricing: Free trial, then $15/user/month
- Call to action: Sign up today
```

### Prompt 4: Technical Overview
```
Create a presentation about our API:
- Title: Developer API Documentation
- REST endpoints overview
- Authentication methods
- Rate limits and quotas
- Example requests
- Support resources
```

## 🎨 Layout Guide

### "title" Layout
- Best for: Opening slides, section dividers, closing slides
- Contains: One large centered title
- Example uses: "Welcome", "Questions?", "Thank You"

### "title_and_content" Layout
- Best for: Main content slides with bullet points
- Contains: Title at top, bullet points below
- Example uses: Features, benefits, agendas, lists

### "blank" Layout
- Best for: Custom content, images, diagrams
- Contains: Empty slide for manual editing
- Example uses: Screenshots, charts, custom graphics

## 💡 Pro Tips

### Tip 1: Keep Bullets Short
❌ Bad:
```json
"bullets": [
  "Our company has been developing innovative solutions for enterprise customers since 2010 and has grown to serve over 500 companies worldwide"
]
```

✅ Good:
```json
"bullets": [
  "Founded in 2010",
  "500+ enterprise customers",
  "Innovative solutions"
]
```

### Tip 2: Use Consistent Structure
```json
{
  "title": "Quarterly Report",
  "slides": [
    {"layout": "title", "title": "Q4 2025 Report"},
    {"layout": "title_and_content", "title": "Revenue", "bullets": ["..."]},
    {"layout": "title_and_content", "title": "Expenses", "bullets": ["..."]},
    {"layout": "title_and_content", "title": "Profit", "bullets": ["..."]},
    {"layout": "title", "title": "Questions?"}
  ]
}
```

### Tip 3: Limit Bullets per Slide
- Aim for 3-5 bullets per slide
- Maximum 7 bullets for readability
- If you have more, split into multiple slides

### Tip 4: Progressive Disclosure
For complex topics, break into multiple slides:
```json
{
  "slides": [
    {
      "title": "Cloud Architecture - Overview",
      "bullets": ["Frontend", "Backend", "Database"]
    },
    {
      "title": "Cloud Architecture - Frontend",
      "bullets": ["React app", "CDN hosted", "Mobile responsive"]
    },
    {
      "title": "Cloud Architecture - Backend",
      "bullets": ["Node.js API", "Serverless functions", "Auto-scaling"]
    }
  ]
}
```

## 🚀 Advanced Usage

### Generating from Data
If you have structured data, format it for the tool:

```javascript
// Example: Convert meeting notes to presentation
const meetingNotes = {
  date: "2025-11-25",
  attendees: ["Alice", "Bob", "Carol"],
  topics: ["Budget", "Hiring", "Launch"],
  decisions: ["Approved $500K", "Hire 3 engineers", "Launch in March"]
};

const presentation = {
  title: `Meeting Summary - ${meetingNotes.date}`,
  slides: [
    {
      layout: "title",
      title: `Team Meeting\n${meetingNotes.date}`
    },
    {
      layout: "title_and_content",
      title: "Attendees",
      bullets: meetingNotes.attendees
    },
    {
      layout: "title_and_content",
      title: "Key Decisions",
      bullets: meetingNotes.decisions
    }
  ]
};
```

### Template-Based Generation
```javascript
function createStatusReport(project) {
  return {
    title: `${project.name} Status Report`,
    slides: [
      {
        layout: "title",
        title: `${project.name}\nStatus Update`
      },
      {
        layout: "title_and_content",
        title: "Progress",
        bullets: [
          `Completion: ${project.completion}%`,
          `Tasks Done: ${project.completed}/${project.total}`,
          `On Track: ${project.onTrack ? 'Yes' : 'No'}`
        ]
      },
      {
        layout: "title_and_content",
        title: "Next Steps",
        bullets: project.nextSteps
      },
      {
        layout: "title_and_content",
        title: "Blockers",
        bullets: project.blockers.length > 0 ? project.blockers : ["None"]
      }
    ]
  };
}
```

## 📊 Common Use Cases

1. **Meeting Summaries** - Quickly document meeting outcomes
2. **Status Reports** - Weekly/monthly project updates
3. **Training Materials** - Educational content
4. **Sales Decks** - Product pitches and demos
5. **Documentation** - Technical guides and tutorials
6. **Proposals** - Business proposals and plans
7. **Onboarding** - New employee orientation
8. **Retrospectives** - Sprint reviews and learnings

## 🎓 Learning Resources

- Try the examples above in the AI Playground
- Experiment with different layouts
- Combine with other MCP tools (calculate metrics, then present them)
- Use AI to generate content, then format as presentation

---

**Remember**: Start simple, then add complexity. A clear, simple presentation is better than a complex, confusing one!
