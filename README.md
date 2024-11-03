# Document Text Extractor(using mistral-7b)

A web application that extracts text information from images and PDFs using OCR (Optical Character Recognition) and processes it using the Mistral AI model to identify specific fields like names, document numbers, and expiration dates.

## Features

- Upload and process images (JPG, JPEG, PNG, WebP) and PDF files
- Extract text using EasyOCR
- Process extracted text using Mistral-7B-Instruct model
- Display extracted information in a clean, user-friendly interface
- Automatic data persistence using localStorage
- Real-time loading states and error handling

## Tech Stack

### Backend
- Flask (Python web framework)
- Flask-CORS for handling Cross-Origin Resource Sharing
- PyMuPDF (fitz) for PDF processing
- EasyOCR for optical character recognition
- Hugging Face Inference API for text processing

### Frontend
- React with TypeScript
- Axios for HTTP requests
- Tailwind CSS for styling

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.7+
- Node.js 14+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ketanspage/Text-Extractor.git
cd Text-Extractor
```

2. Set up the backend:
```bash
cd server
# Create and activate a virtual environment (optional but recommended)
conda create -p venv python==3.xx
conda activate venv  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
# Navigate to the frontend directory
cd client

# Install dependencies
npm install
# or
yarn install
```

## Configuration

1. Replace the Hugging Face API key in `app.py`:
```python
client = InferenceClient(api_key="your-hugging-face-api-key")
```

2. Update the CORS settings in `app.py` if your frontend runs on a different port:
```python
CORS(app, resources={r"/upload": {"origins": "your-frontend-url"}})
```

## Running the Application

1. Start the Flask backend:
```bash
# From the root directory
python app.py
```
The backend will run on `http://localhost:5000`

2. Start the React frontend:
```bash
# From the frontend directory
npm run dev
# or
yarn dev
```
The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Click the file input to upload an image or PDF
3. Click "Extract Data" to process the file
4. View the extracted information displayed below the form

## API Endpoints

### POST /upload
- Accepts multipart form data with a file
- Supports JPG, JPEG, PNG, WebP, and PDF files
- Returns JSON with extracted text information

Response format:
```json
{
  "extracted_data": "Name: John Doe\nDocument Number: ABC123\nExpiration Date: 2025-12-31"
}
```

## Error Handling

The application includes error handling for:
- Invalid file formats
- Missing files
- API errors
- Text extraction failures
