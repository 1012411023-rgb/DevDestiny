import re

with open('frontend/src/pages/app/Dashboard.jsx', 'r') as f:
    content = f.read()

# Fix Avg Pass Rate
content = re.sub(
    r'value=\{`\$\{passRate\}%`\}', 
    r'value={history.length === 0 ? "0%" : `${passRate}%`}', 
    content
)

# Fix Empty state text for history table
content = content.replace(
    'No inspections yet. Start an inspection to see results here.',
    'No inspections yet. Run your first inspection to see results.'
)

# Fix pie chart 
# Wait, let's see how pie chart is currently handled
