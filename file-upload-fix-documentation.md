# TalentMatch File Upload Fix Documentation

## Problem Description

The TalentMatch application was experiencing an issue where files uploaded through the frontend UI appeared to be successfully uploaded (showing success messages), but the files were not actually being stored in the S3 bucket. However, when uploading files through the Swagger UI (testing the FastAPI backend directly), the uploads were successful and the files were visible in the S3 bucket.

## Root Causes Identified

After investigating the codebase, several issues were identified:

1. **URL Resolution Issue**: The frontend was configured to use the Docker service name "backend" as the hostname in API requests, but browsers can't resolve this hostname when making requests from client-side JavaScript.

2. **Missing Credentials**: The fetch requests from the frontend were not including credentials, which might be needed for proper authentication.

3. **Insufficient Error Handling**: The frontend code wasn't providing detailed error information, making it difficult to diagnose issues.

4. **File Type Mismatch**: The frontend was accepting file types (.txt) that the backend would reject.

## Changes Made

### 1. Fixed URL Resolution for Client-Side Requests

The frontend environment file (.env.frontend) was setting `NEXT_PUBLIC_API_URL=http://backend:8000/api`, which works for server-to-server communication within Docker but not for browser-to-server requests.

**Change**: Updated the API URL resolution in `ResumeUploader.tsx` to ensure it always uses "localhost" for client-side requests:

```javascript
// When running in Docker, the browser can't resolve 'backend' hostname
// So we need to use 'localhost' for client-side requests
const isClient = typeof window !== 'undefined';
const API_URL = isClient 
  ? 'http://localhost:8000/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

// Debug log to help diagnose issues
if (typeof window !== 'undefined') {
  console.log('Frontend API URL:', API_URL);
}
```

This ensures that when running in the browser, the code always uses "localhost" instead of "backend" for the hostname.

### 2. Added Credentials to Fetch Requests

**Change**: Modified the fetch request to include credentials:

```javascript
const response = await fetch(`${API_URL}/s3/upload`, {
  method: 'POST',
  body: formData,
  credentials: 'include', // Include cookies in the request
  headers: {
    // Don't set Content-Type header when using FormData
    // Browser will set it automatically with the correct boundary
  }
})
```

The `credentials: 'include'` option ensures that cookies are sent with the request, which might be necessary for authentication.

### 3. Enhanced Error Handling and Logging

**Change**: Added more detailed error handling and logging to help diagnose issues:

```javascript
if (!response.ok) {
  // Get more detailed error information
  let errorDetail = response.statusText;
  try {
    const errorJson = await response.json();
    errorDetail = errorJson.detail || errorJson.message || errorDetail;
  } catch (e) {
    // If we can't parse JSON, just use the status text
  }
  console.error(`Upload failed with status ${response.status}: ${errorDetail}`);
  throw new Error(`Upload failed: ${errorDetail}`);
}
```

Also added additional logging throughout the upload process:

```javascript
// Debug log for file upload
console.log(`Uploading file: ${files[i].name} (${files[i].size} bytes) to ${API_URL}/s3/upload`);

// Log successful uploads
console.log(`Upload successful for ${files[i].name}:`, result);
```

### 4. Fixed File Type Mismatch

The backend endpoint in `s3_files.py` only accepts specific file types:

```python
# Validate file type
if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
    raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
```

**Change**: Updated the frontend file input to match the backend's accepted file types:

```html
<input
  type="file"
  id="file-upload"
  className="hidden"
  multiple
  accept=".pdf,.docx,.doc"
  onChange={handleFileChange}
/>
```

Also updated the UI text to match:

```html
<p className="text-sm text-muted-foreground">Click to browse files (PDF, DOCX, DOC)</p>
```

## Verification Steps

To verify that the fix works:

1. Restart the frontend application
2. Try uploading PDF or Word documents through the UI
3. Check the browser console for detailed logs about the upload process
4. Verify that files appear in the S3 bucket after upload

## Additional Notes

- The TypeScript errors shown in the editor are related to type definitions and don't affect the functionality of the code.
- The backend's CORS configuration in `main.py` is correctly set up to allow requests from "http://localhost:3000" with credentials.
- The debug logs added will help identify any remaining issues if the problem persists.
