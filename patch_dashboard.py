import re

with open("frontend/src/pages/app/Dashboard.jsx", "r") as f:
    content = f.read()

# adding imports
content = content.replace("import { \n  CheckCircle2,", "import React, { useState, useEffect } from 'react';\nimport { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';\nimport { \n  CheckCircle2,")

# adding state and fetch
new_code = """
export default function Dashboard() {
  const { templates } = useTemplates();
  const { history } = useInspection();

  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/stats/pie-chart`)
      .then(res => res.json())
      .then(data => {
        setPieData([
          { name: 'Pass', value: data.pass, color: '#10b981' },
          { name: 'Fail', value: data.fail, color: '#ef4444' }
        ]);
      })
      .catch(err => console.error(err));
  }, []);
"""

content = content.replace("export default function Dashboard() {\n  const { templates } = useTemplates();\n  const { history } = useInspection();", new_code)


chart_code = """
        {/* Quick Actions / Integration Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Inspection Overview</h2>
          <Card className="border border-gray-200 p-6 bg-white">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Pass / Fail Trend</h4>
            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              )}
            </div>
          </Card>
          
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
"""

content = content.replace("{/* Quick Actions / Integration Info */}\n        <div className=\"space-y-6\">\n          <h2 className=\"text-lg font-bold text-gray-900\">Quick Actions</h2>", chart_code)


with open("frontend/src/pages/app/Dashboard.jsx", "w") as f:
    f.write(content)
