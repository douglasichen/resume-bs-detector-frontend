import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [roleSelection, setRoleSelection] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [name, setName] = useState('')
  const [companyOrSchool, setCompanyOrSchool] = useState('')

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    setFiles(pdfFiles)
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || files.length === 0) {
      alert('Please provide email and select at least one PDF file')
      return
    }

    setIsUploading(true)

    try {
      // Convert all PDF files to base64
      const resumes = await Promise.all(
        files.map(file => convertToBase64(file))
      )

      // Send to API
      console.log(import.meta.env.VITE_PROCESS_RESUME_API_URL)
      const apiUrl = import.meta.env.VITE_PROCESS_RESUME_API_URL
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const eventsResponse = await fetch(import.meta.env.VITE_EVENTS_API_URL);
      const events = await eventsResponse.json();
      console.log(events);



      const payload = {
        email,
        resumes
      };

      // Add optional marketing analytics fields if provided
      const role = roleSelection === 'Other' ? customRole : roleSelection;
      if (role) payload.role = role;
      if (name) payload.name = name;
      if (companyOrSchool) payload.companyOrSchool = companyOrSchool;

      console.log(`PAYLOAD: ${JSON.stringify(payload, null, 2)}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log(`[RESPONSE] ${response}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }


      // no need to reset the info, just the resume files.
      // alert('We will email you our report soon!')
      alert('Unfortunately, we have hit our proccessing limit for today... Please try again, or request for closed beta access here:\n https://docs.google.com/forms/d/e/1FAIpQLSfg_zNuAeGusQI-N5Ps7aDXtbsPsIa8weGddXVL7GXxOcrEnw/viewform')
      // setEmail('')
      setFiles([])
      // setRoleSelection('')
      // setCustomRole('')
      // setName('')
      // setCompanyOrSchool('')
      e.target.reset()
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container">
      <h1>Resume Bullsh*t Detector</h1>
      <p className="info-note">
        Our analysis takes a moment to process. We'll send your report to your email shortly. 
        <strong> Please check your junk folder!</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <div className="section-header">Your Information</div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role (Optional)</label>
          <select
            id="role"
            value={roleSelection}
            onChange={(e) => {
              setRoleSelection(e.target.value);
              if (e.target.value !== 'Other') {
                setCustomRole('');
              }
            }}
          >
            <option value="">Select a role...</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Hiring Manager">Hiring Manager</option>
            <option value="Applicant">Applicant</option>
            <option value="Other">Other</option>
          </select>
          {roleSelection === 'Other' && (
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Please specify your role"
              className="other-input"
            />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">Name (Optional)</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="companyOrSchool">Company or School (Optional)</label>
          <input
            id="companyOrSchool"
            type="text"
            value={companyOrSchool}
            onChange={(e) => setCompanyOrSchool(e.target.value)}
            placeholder="Company or school name"
          />
        </div>

        <div className="section-divider"></div>

        <div className="form-group">
          <label htmlFor="files">PDF Files to Analyze *</label>
          {/* <p className="disclaimer">Note: Currently only 1 PDF can be processed at a time.</p> */}
          <input
            id="files"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileChange}
            required
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}

export default App
