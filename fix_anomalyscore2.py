import re

with open('frontend/src/pages/app/Results.jsx', 'r') as f:
    text = f.read()

text = text.replace('style={{ width: `${Number(currentResult.anomalyScore).toFixed(2) + "%"}` }}', 'style={{ width: Number(currentResult.anomalyScore).toFixed(2) + "%" }}')

text = text.replace('<span className={`${isPass ? \'text-green-600\' : \'text-red-600\'}`}>{Number(currentResult.anomalyScore).toFixed(2) + "%"}</span>', '<span className={isPass ? \'text-green-600\' : \'text-red-600\'}>{Number(currentResult.anomalyScore).toFixed(2) + "%"}</span>')

with open('frontend/src/pages/app/Results.jsx', 'w') as f:
    f.write(text)

