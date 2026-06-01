import requests
import urllib.request
import os

print("Downloading sample audio file...")
audio_url = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg"
test_file = "test_audio.ogg"
urllib.request.urlretrieve(audio_url, test_file)

print("Sending audio to the STT API...")
url = "http://127.0.0.1:10000/api/stt"
try:
    with open(test_file, "rb") as f:
        files = {"file": ("test_audio.ogg", f, "audio/ogg")}
        data = {"language": "en"}
        response = requests.post(url, files=files, data=data)
        
    print("\nStatus Code:", response.status_code)
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print("\nError:", e)
finally:
    if os.path.exists(test_file):
        os.remove(test_file)
