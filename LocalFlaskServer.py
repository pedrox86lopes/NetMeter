from flask import Flask, request, jsonify, json

app = Flask(__name__)

@app.route('/nmcollector', methods=['POST'])
def nmcollector():
    data = request.json
    print(f"Received data: {data}")
    # Save data to a file
    with open("collected_data.json", "a") as f:
        f.write(json.dumps(data) + "\n")
    return jsonify({"status": "success"}), 200


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
