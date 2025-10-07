// Simple test for assign-mail API
// This will be run separately to avoid conflicts

const testAPI = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3002/api/assign-mail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mailId: 'test-mail-id',
        picId: 'test-pic-id',
        assignmentType: 'pic'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.status === 404) {
      console.log('❌ API /api/assign-mail NOT found!');
    } else {
      console.log('✅ API /api/assign-mail exists!');
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
};

testAPI();