from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import os
import uuid
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Create a temporary directory for audio files
AUDIO_DIR = Path("temp_audio")
AUDIO_DIR.mkdir(exist_ok=True)

@app.route("/")
def index():
    return "Python service ready for development"

@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    """
    Convert Croatian text to speech
    Expects JSON: { "text": "Some Croatian text" }
    Returns: audio file (mp3)
    """
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = AUDIO_DIR / filename
        
        # Generate speech using gTTS with Croatian language
        tts = gTTS(text=text, lang='hr', slow=False)
        tts.save(str(filepath))
        
        # Send the file and delete it after sending
        response = send_file(
            str(filepath),
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
        
        # Clean up the file after a delay (you might want to implement a better cleanup strategy)
        # For now, files will accumulate - consider adding a cleanup job
        
        return response
        
    except Exception as e:
        print(f"Error generating TTS: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/tts/cleanup", methods=["POST"])
def cleanup_audio():
    """
    Clean up old audio files
    """
    try:
        for file in AUDIO_DIR.glob("*.mp3"):
            try:
                file.unlink()
            except Exception as e:
                print(f"Error deleting {file}: {e}")
        
        return jsonify({"message": "Cleanup completed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=6000, debug=True)