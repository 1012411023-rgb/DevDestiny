import sys, re

def print_conflicts(path):
    with open(path) as f:
        content = f.read()
    
    parts = re.split(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> origin/khushi\n', content, flags=re.DOTALL)
    print(f"--- {path} ---")
    if len(parts) == 1:
        print("No conflicts found.")
    for i in range(1, len(parts), 3):
        print(f"Conflict {i//3 + 1}:")
        print("HEAD:\n", parts[i][:300], "...\n")
        print("KHUSHI:\n", parts[i+1][:300], "...\n")
        print("-" * 40)

for f in ["backend/app.py", "frontend/src/pages/app/AddProduct.jsx", "frontend/src/pages/app/Inspection.jsx", "frontend/src/pages/app/Results.jsx"]:
    print_conflicts(f)
