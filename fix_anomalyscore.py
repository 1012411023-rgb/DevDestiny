import os
import re

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Pattern 1: {row.anomalyScore}%
            content = re.sub(r'\{([A-Za-z0-9_\.]+anomalyScore)\}%', r'{Number(\1).toFixed(2) + "%"}', content)
            
            # Pattern 2: {Number(row.anomalyScore).toFixed(2)}%
            content = re.sub(r'\{Number\(([A-Za-z0-9_\.]+anomalyScore)\)\.toFixed\(\d+\)\}%', r'{Number(\1).toFixed(2) + "%"}', content)
            
            # Pattern 3: `${currentResult.anomalyScore}%`
            content = re.sub(r'`\$\{([A-Za-z0-9_\.]+anomalyScore)\}%`', r'(\1 + "%")', content)

            with open(filepath, 'w') as f:
                f.write(content)

