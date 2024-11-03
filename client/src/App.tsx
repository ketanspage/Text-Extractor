import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface ExtractedData {
  name?: string;
  documentNumber?: string;
  expirationDate?: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(() => {
    const savedData = localStorage.getItem('extractedData');
    return savedData ? JSON.parse(savedData) : null;
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (extractedData) {
      localStorage.setItem('extractedData', JSON.stringify(extractedData));
    }
  }, [extractedData]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setExtractedData(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true); 

    try {
      const response = await axios.post<{ extracted_data: string }>('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const extractedData = parseExtractedData(response.data.extracted_data);
      setExtractedData(extractedData);
    } catch (error) {
      setError('Error extracting text.');
    } finally {
      setLoading(false); 
    }
  };

  const parseExtractedData = (text: string): ExtractedData => {
    const data: ExtractedData = {};
    const nameMatch = text.match(/name:\s*([^\n]+)/i);
    const docNumberMatch = text.match(/document number:\s*([^\n]+)/i);
    const expirationDateMatch = text.match(/expiration date:\s*([^\n]+)/i);

    if (nameMatch) data.name = nameMatch[1];
    if (docNumberMatch) data.documentNumber = docNumberMatch[1];
    if (expirationDateMatch) data.expirationDate = expirationDateMatch[1];

    return data;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Document Text Extractor</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="mb-4 text-sm text-gray-600 border border-gray-300 rounded w-full py-2 px-3 bg-gray-50 focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
          {loading ? 'Extracting...' : 'Extract Data'}
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <p className="ml-4 text-blue-700 font-semibold">Extracting data, please wait...</p>
        </div>
      )}

      {!loading && extractedData && (
        <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Extracted Data:</h3>
          <p className="text-sm"><strong>Name:</strong> {extractedData.name || 'Not found'}</p>
          <p className="text-sm"><strong>Document Number:</strong> {extractedData.documentNumber || 'Not found'}</p>
          <p className="text-sm"><strong>Expiration Date:</strong> {extractedData.expirationDate || 'Not found'}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default App;
