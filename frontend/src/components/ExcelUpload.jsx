import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  LinearProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { uploadService } from '../services/api';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        processExcel(selectedFile);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const processExcel = (file) => {
    setLoading(true);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Preview first 5 rows
        setPreview(jsonData.slice(0, 6));
        setLoading(false);
      } catch (error) {
        setError('Error processing file. Please check the file format.');
        setLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      const result = await uploadService.uploadExcel(file);
      setSuccess(true);
      // Optionally fetch and display summary
      const summary = await uploadService.getSummary();
      // Update your state with summary data
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Error uploading file');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Paper className="p-8">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          <Typography variant="h5" className="font-bold">
            Upload Excel Report
          </Typography>
        </div>

        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload className="w-4 h-4" />}
                className="mb-4"
              >
                Choose File
              </Button>
            </label>
            <Typography variant="body2" className="text-gray-600">
              Supported formats: .xlsx, .xls
            </Typography>
          </div>
        </div>

        {loading && (
          <div className="mb-4">
            <LinearProgress />
          </div>
        )}

        {error && (
          <Alert 
            severity="error" 
            icon={<AlertCircle className="w-5 h-5" />}
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success"
            icon={<Check className="w-5 h-5" />}
            className="mb-4"
          >
            File uploaded successfully!
          </Alert>
        )}

        {preview && (
          <div className="mb-6">
            <Typography variant="h6" className="mb-4">
              Preview
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {preview[0].map((header, index) => (
                      <TableCell key={index}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {file && !loading && (
          <Button
            variant="contained"
            onClick={handleUpload}
            startIcon={<Upload className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upload File
          </Button>
        )}
      </Paper>
    </div>
  );
};

export default ExcelUpload;