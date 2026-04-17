import requests; print(requests.post('http://localhost:5000/api/products/test/inspect', files={'file': open('backend/app.py', 'rb')}).text)
