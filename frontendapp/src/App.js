import React, { useState } from 'react';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [doctorNames, setDoctorNames] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [locations, setLocations] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null); // Store the selected slot

  // Predefined doctor names array for dropdown
  const predefinedDoctors = [
    { name: 'Dr John Doe', firstName: 'John', lastName: 'Doe' },
    { name: 'Dr Jane Smith', firstName: 'Jane', lastName: 'Smith' },
    { name: 'Dr William Johnson', firstName: 'William', lastName: 'Johnson' },
    { name: 'Dr Christina Applegate', firstName: 'Christina', lastName: 'Applegate' }
  ];

  // Handle doctor search based on name (fetches doctor list from API)
  const handleSearch = async () => {
    const url = `http://localhost:8081/fhir/r4/Practitioner?family=${lastName}&given=${firstName}`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      const names = data.entry.map((entry) => ({
        text: entry.resource.name[0].text,
        id: entry.resource.id,
      }));

      setDoctorNames(names);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setAvailableSlots([]);
    setSelectedSlot(null); // Reset selected slot when doctor changes
  };

  const handleDateChange = (e) => {
    setAppointmentDate(e.target.value);
  };

  const handleAppointment = async () => {
    if (selectedDoctor && appointmentDate) {
      const startDate = appointmentDate;
      const endDate = appointmentDate;
      const practitionerId = selectedDoctor.id;

      const url = `http://localhost:8082/fhir/r4/Slot?startDate=${startDate}&endDate=${endDate}&practitioner=${practitionerId}`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();

        const slots = data.entry.map((entry) => ({
          start: entry.resource.start,
          reference: entry.resource.id, // Original slot ID from FHIR response
          locationReference: entry.resource.extension[0].valueReference.reference.split('/').pop() // Extract location ID
        }));

        setAvailableSlots(slots);
        fetchLocationNames(slots);
      } catch (error) {
        console.error('Error fetching slot data:', error);
        setAvailableSlots([{ error: 'Failed to fetch slot data.' }]);
      }
    } else {
      alert('Please select a doctor and an appointment date.');
    }
  };

  const fetchLocationNames = async (slots) => {
    const newLocations = { ...locations };

    for (const slot of slots) {
      if (!newLocations[slot.locationReference]) {
        try {
          const locationUrl = `http://localhost:8084/fhir/r4/Location/${slot.locationReference}`;
          const res = await fetch(locationUrl);
          const data = await res.json();
          newLocations[slot.locationReference] = data.name;
        } catch (error) {
          console.error(`Error fetching location for reference ${slot.locationReference}:`, error);
          newLocations[slot.locationReference] = 'Unknown location';
        }
      }
    }

    setLocations(newLocations);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot); // Set the selected slot directly
  };

  const createAppointment = async () => {
    if (!selectedSlot) {
      alert('Please select a slot before creating an appointment.');
      return;
    }

    const appointmentData = {
      resourceType: 'Appointment',
      status: 'booked',
      slot: [
        {
          reference: `Slot/${selectedSlot.reference}`, // Original slot ID
        }
      ],
      start: selectedSlot.start,
      end: new Date(new Date(selectedSlot.start).getTime() + 30 * 60000).toISOString(), // Add 30 minutes to start time
      participant: [
        {
          actor: {
            reference: 'Patient/12724066', // Hardcoded for now
          },
          status: 'accepted',
        }
      ]
    };

    try {
      const res = await fetch('http://localhost:8083/fhir/r4/Appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(appointmentData),
      });

      if (res.ok) {
        alert('Appointment successfully created!');
      } else {
        alert('Failed to create appointment.');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  // Function to deduplicate slots based on start time and location
  const getUniqueSlots = () => {
    const uniqueSlots = [];
    const seenSlots = new Set();

    for (const slot of availableSlots) {
      const location = locations[slot.locationReference] || 'Loading...';
      const slotKey = `${slot.start}-${location}`;

      if (!seenSlots.has(slotKey)) {
        uniqueSlots.push(slot);
        seenSlots.add(slotKey); // Track unique slots based on start time and location
      }
    }

    return uniqueSlots;
  };

  return (
    <div className="container">
      <h1>Book an Appointment</h1>
      
      <div className="input-container">
        <select onChange={(e) => {
          const selected = predefinedDoctors.find(doc => doc.name === e.target.value);
          setFirstName(selected.firstName);
          setLastName(selected.lastName);
        }}>
          <option value="">Select a Predefined Doctor</option>
          {predefinedDoctors.map((doctor, index) => (
            <option key={index} value={doctor.name}>
              {doctor.name}
            </option>
          ))}
        </select>
        <button onClick={handleSearch}>Search Doctor</button>
      </div>

      {doctorNames.length > 0 && (
        <div className="results">
          <h2>Doctor Search Results:</h2>
          <div className="doctor-list">
            {doctorNames.map((doctor, index) => (
              <div
                key={index}
                className={`doctor-box ${selectedDoctor && selectedDoctor.id === doctor.id ? 'selected' : ''}`}
                onClick={() => handleDoctorClick(doctor)}
              >
                {doctor.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="appointment-section">
          <h2>Select Appointment Date for {selectedDoctor.text}</h2>
          <input
            type="date"
            value={appointmentDate}
            onChange={handleDateChange}
          />
          <button onClick={handleAppointment}>Set Appointment</button>
        </div>
      )}

      {availableSlots.length > 0 && (
        <div className="available-slots">
          <h2>Available Slots</h2>
          <div className="slot-list">
            {getUniqueSlots().map((slot, index) => (
              <div
                key={index}
                className={`slot-box ${selectedSlot && selectedSlot.reference === slot.reference && selectedSlot.start === slot.start ? 'selected-slot' : ''}`}
                onClick={() => handleSlotClick(slot)}
              >
                <p><strong>Start Time:</strong> {new Date(slot.start).toLocaleString()}</p>
                <p><strong>Location:</strong> {locations[slot.locationReference] || 'Loading...'}</p>
              </div>
            ))}
          </div>
          {selectedSlot && (
            <button className="create-appointment" onClick={createAppointment}>
              Create Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
