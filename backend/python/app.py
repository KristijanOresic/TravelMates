from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Python service ready for development"

if __name__ == "__main__":
    app.run(port=6000)
