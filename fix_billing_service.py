with open('frontend/src/services/billingService.js', 'r') as f:
    text = f.read()

import re

new_text = text.replace(
'''      const response = await fetch(`${API_BASE_URL}/api/billing/history`);''',
"""      const token = localStorage.getItem('devdestany_token');
      const response = await fetch(`${API_BASE_URL}/api/billing/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });""")

new_text = new_text.replace(
'''        headers: {
          'Content-Type': 'application/json',
        },''',
"""        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devdestany_token')}`
        },""")

with open('frontend/src/services/billingService.js', 'w') as f:
    f.write(new_text)
