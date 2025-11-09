# Markdown Support in Chat Responses

The chat view now properly renders markdown in AI responses using `react-markdown`.

## Supported Markdown Features

### 1. Headings

```markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4
```

### 2. Text Formatting

```markdown
**Bold text**
_Italic text_
**_Bold and italic_**
~~Strikethrough~~ (with remark-gfm)
```

### 3. Lists

**Unordered:**

```markdown
- Item 1
- Item 2
  - Nested item
- Item 3
```

**Ordered:**

```markdown
1. First item
2. Second item
3. Third item
```

### 4. Code

**Inline code:**

```markdown
Use `console.log()` to debug
```

**Code blocks:**

````markdown
```javascript
function example() {
  return "Hello World";
}
```
````

### 5. Blockquotes

```markdown
> This is a quote
> It can span multiple lines
```

### 6. Links

```markdown
[Link text](https://example.com)
```

### 7. Tables (with remark-gfm)

```markdown
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

### 8. Task Lists (with remark-gfm)

```markdown
- [x] Completed task
- [ ] Incomplete task
```

## Example AI Response

When the backend returns:

```markdown
Based on your transaction data analysis:

**Key Findings:**

Your top 3 clients currently represent 67% of your total revenue. Here's what this means:

1. **High concentration risk** - Dependency on few clients
2. **Revenue volatility** - Potential impact if client churns
3. **Growth opportunity** - Diversification recommended

**Strategic Recommendations:**

- Diversify client base to reduce concentration below 50%
- Implement quarterly business reviews with top clients
- Build reserves equal to 15% of top client revenue

> **Financial Impact:** Reducing concentration could lower your cost of capital by 0.5-1%

For implementation, consider using `client-diversification-strategy.pdf` template.

[Learn more about risk management](https://nedbank.co.za/risk-management)
```

It will render with:

- ✅ Proper heading hierarchy
- ✅ Bold text formatting
- ✅ Numbered lists
- ✅ Bullet points
- ✅ Blockquote styling
- ✅ Inline code highlighting
- ✅ Clickable links

## Custom Styling

The markdown components are styled to match the chat interface:

- **Headings**: Semibold with appropriate spacing
- **Paragraphs**: Small text (text-sm) with relaxed leading
- **Lists**: Properly indented with spacing
- **Code**: Muted background with monospace font
- **Links**: Primary color with hover underline
- **Blockquotes**: Left border with italic text

## Benefits

1. **Better Readability**: Proper formatting makes responses easier to scan
2. **Rich Content**: Support for complex information structures
3. **Professional Look**: Consistent styling throughout
4. **Extensible**: Easy to add more markdown features if needed

## Testing

The backend can now return properly formatted markdown, and it will be rendered correctly in the chat:

```bash
# Example API response with markdown
{
  "answer": "## Analysis Results\n\n**Key metrics:**\n\n1. Revenue growth: 23%\n2. Client retention: 89%\n\nSee full report: [Download PDF](https://...)",
  "follow_up_prompts": [...],
  "relevant_offerings": [...]
}
```
