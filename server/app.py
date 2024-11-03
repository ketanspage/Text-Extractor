from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF for PDF handling
import easyocr
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "http://localhost:5173"}})
load_dotenv()
reader = easyocr.Reader(['en'])  # Specify language
client = InferenceClient(api_key=os.getenv("HUGGINGFACE_API_KEY"))

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()

    try:
        # Extract text from image or PDF
        extracted_text = ""
        if file_ext in ['.jpg', '.jpeg', '.png', '.webp']:
            image_path = f"./temp_{filename}"
            file.save(image_path)
            extracted_text = " ".join(reader.readtext(image_path, detail=0))
            os.remove(image_path)
        elif file_ext == '.pdf':
            with fitz.open(stream=file.read(), filetype="pdf") as pdf:
                for page_num in range(pdf.page_count):
                    page = pdf[page_num]
                    extracted_text += page.get_text()
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        # Set up prompt for extraction
        messages = [
            { "role": "user", "content": f"Extract the name, document number, and expiration date from the following text:\n\n{extracted_text}" }
        ]

        # Send request to Hugging Face API
        stream = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.3", 
            messages=messages, 
            max_tokens=500,
            stream=True
        )

        # Parse response
        result_text = ""
        for chunk in stream:
            result_text += chunk.choices[0].delta.content
        
        return jsonify({"extracted_data": result_text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
