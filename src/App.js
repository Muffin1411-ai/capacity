import React, { useState } from 'react';
import { Truck, AlertTriangle } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverNIK: '',
    odometer: '',
    destination: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="w-6 h-6" />
          <h1 className="text-xl font-bold">Form IN/OUT DC</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
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
              value={formData.driverNIK}
              onChange={(e) => setFormData({...formData, driverNIK: e.target.value})}
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
              value={formData.odometer}
              onChange={(e) => setFormData({...formData, odometer: e.target.value})}
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
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              placeholder="Enter destination"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;