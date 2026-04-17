import sys
sys.path.append('/home/ashitosh/Desktop/DevDestany/backend')
from ai.inference import inspect_image
try:
    print(inspect_image('abc', '/tmp/test_img.jpg'))
except Exception as e:
    import traceback
    traceback.print_exc()
