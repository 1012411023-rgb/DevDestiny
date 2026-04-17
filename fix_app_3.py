with open("backend/app.py", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("<<<<<<< HEAD"):
        skip = True
        continue
    elif line.startswith("======="):
        # We might want to keep the origin/khushi part or not, 
        # Actually I already wrote out what the final state should be. Let's just find the function bounds.
        pass
