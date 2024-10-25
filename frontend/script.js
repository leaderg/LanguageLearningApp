async function uploadFile() {
    const fileInput = document.getElementById('srtFile');
    const resultDiv = document.getElementById('result');
    const jsonOutput = document.getElementById('jsonOutput');

    if (!fileInput.files.length) {
        alert('Please select a file first');
        return;
    }

    const file = fileInput.files[0];
    if (!file.name.endsWith('.srt')) {
        alert('Please select an SRT file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            timeout: 60000, // 60 second timeout
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            const errorMessage = data.error ? `${data.error}: ${data.details}` : 'Failed to process file';
            throw new Error(errorMessage);
        }

        resultDiv.style.display = 'block';
        jsonOutput.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        alert('Error: ' + error.message);
        resultDiv.style.display = 'none';
    }
}
