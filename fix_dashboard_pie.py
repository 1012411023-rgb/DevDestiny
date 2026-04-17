with open('frontend/src/pages/app/Dashboard.jsx', 'r') as f:
    content = f.read()

# Handle empty state
content = content.replace(
'''              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>''',
'''              {pieData.length > 0 && (pieData[0].value + pieData[1].value) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>''')

content = content.replace(
'''              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              )}''',
'''              ) : pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center px-4">No inspection data yet to display chart.</div>
              )}''')

with open('frontend/src/pages/app/Dashboard.jsx', 'w') as f:
    f.write(content)
