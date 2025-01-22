// App.js - Part 1: Imports, Initial State, and Camera Functions
import React, { useState, useEffect } from 'react';
import { Truck, Fuel, Camera, Upload, AlertTriangle, Clock } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzNxjFr9X7F_ZDQwW0lo0vj0DCWmN5Jevc2YXg_4w0LLtYZUBAQDtxQQz2UUCEh7HXL/exec';

function App() {
  // State Management
  const [activeTab, setActiveTab] = useState('checkinout');
  const [checkinoutData, setCheckinoutData] = useState({
    vehicleNumber: '',
    driverNIK: '',
    odometer: '',
    destination: ''
  });
  const [fuelData, setFuelData] = useState({
    vehicleNumber: '',
    driverNIK: '',
    liters: '',
    cost: '',
    currentOdometer: '',
    receipt: null
  });

  // UI States
  const [receiptPreview, setReceiptPreview] = useState('');
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [lastOdometer, setLastOdometer] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Camera Ref
  const videoRef = React.useRef(null);
  const [stream, setStream] = useState(null);

  // Camera Functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }  // Use back camera
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const photo = canvas.toDataURL('image/jpeg');
    setReceiptPreview(photo);
    setFuelData({ ...fuelData, receipt: photo });
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // File Upload Handler for manual photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {  // 5MB limit
        setError('Photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
        setFuelData({ ...fuelData, receipt: file });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation Functions
  const validateOdometer = (value) => {
    const numValue = parseFloat(value);
    if (numValue < lastOdometer) {
      setError(`Odometer reading cannot be lower than last reading (${lastOdometer})`);
      return false;
    }
    if (numValue - lastOdometer > 1000) {
      if (!window.confirm(`Warning: ${numValue - lastOdometer}km since last reading. Is this correct?`)) {
        return false;
      }
    }
    setError('');
    return true;
  };

  // Form Submit Handlers
  const handleCheckinoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add your Google Sheets submission logic here
      console.log('Check In/Out Submitted:', checkinoutData);
      setCheckinoutData({
        vehicleNumber: '',
        driverNIK: '',
        odometer: '',
        destination: ''
      });
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    if (!validateOdometer(fuelData.currentOdometer)) {
      return;
    }
    if (!fuelData.receipt) {
      setError('Please upload receipt photo');
      return;
    }

    setLoading(true);
    try {
      // Add your Google Sheets submission logic here
      console.log('Fuel Log Submitted:', fuelData);
      setFuelData({
        vehicleNumber: '',
        driverNIK: '',
        liters: '',
        cost: '',
        currentOdometer: '',
        receipt: null
      });
      setReceiptPreview('');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'checkinout' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('checkinout')}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Check IN/OUT
          </div>
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'fuel' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('fuel')}
        >
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            Fuel Log
          </div>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Camera UI */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={takePhoto}
                className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-500 text-white p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check In/Out Form */}
      {activeTab === 'checkinout' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCheckinoutSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={checkinoutData.vehicleNumber}
                onChange={(e) => setCheckinoutData({...checkinoutData, vehicleNumber: e.target.value.toUpperCase()})}
                placeholder="Enter vehicle number"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Driver NIK
              </label>
              <input
                type="text"
                value={checkinoutData.driverNIK}
                onChange={(e) => setCheckinoutData({...checkinoutData, driverNIK: e.target.value})}
                placeholder="Enter NIK"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Odometer Reading
              </label>
              <input
                type="number"
                value={checkinoutData.odometer}
                onChange={(e) => setCheckinoutData({...checkinoutData, odometer: e.target.value})}
                placeholder="Current odometer reading"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Destination
              </label>
              <input
                type="text"
                value={checkinoutData.destination}
                onChange={(e) => setCheckinoutData({...checkinoutData, destination: e.target.value})}
                placeholder="Enter destination"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {/* Fuel Log Form */}
      {activeTab === 'fuel' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleFuelSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                value={fuelData.vehicleNumber}
                onChange={(e) => setFuelData({...fuelData, vehicleNumber: e.target.value.toUpperCase()})}
                placeholder="Enter vehicle number"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Driver NIK
              </label>
              <input
                type="text"
                value={fuelData.driverNIK}
                onChange={(e) => setFuelData({...fuelData, driverNIK: e.target.value})}
                placeholder="Enter NIK"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Current Odometer
              </label>
              <input
                type="number"
                value={fuelData.currentOdometer}
                onChange={(e) => {
                  setFuelData({...fuelData, currentOdometer: e.target.value});
                  validateOdometer(e.target.value);
                }}
                placeholder="Current odometer reading"
                className="w-full p-2 border rounded"
                required
              />
              {lastOdometer > 0 && (
                <span className="text-sm text-gray-500">
                  Last reading: {lastOdometer}km
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Receipt Photo
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-blue-500 text-white p-2 rounded flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="flex-1 p-2 border rounded"
                  />
                </div>
                {receiptPreview && (
                  <div className="relative w-32 h-32">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptPreview('');
                        setFuelData({ ...fuelData, receipt: null });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Liters of Fuel
              </label>
              <input
                type="number"
                value={fuelData.liters}
                onChange={(e) => setFuelData({...fuelData, liters: e.target.value})}
                placeholder="Enter liters"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Cost (Rp)
              </label>
              <input
                type="number"
                value={fuelData.cost}
                onChange={(e) => setFuelData({...fuelData, cost: e.target.value})}
                placeholder="Enter total cost"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Fuel className="w-4 h-4" />
              )}
              {loading ? 'Submitting...' : 'Log Fuel Purchase'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;