document.addEventListener('DOMContentLoaded', function () {
    // Form and DOM elements
    const opportunityForm = document.getElementById('opportunity-form');
    const responseDiv = document.getElementById('form-response');

    // Function to submit a job opportunity
    async function postOpportunity(event) {
        event.preventDefault();

        // Gather form data
        const formData = new FormData(opportunityForm);
        const job = {
            job_title: formData.get('job_title'),
            company_name: formData.get('company_name'),
            location: formData.get('location'),
            skills_required: formData.get('skills_required')?.split(',').map(skill => skill.trim()),
            job_description: formData.get('job_description'),
        };

        try {
            // Send job data to Project B
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job),
            });

            const result = await response.json();

            if (response.ok) {
                // Display success message
                responseDiv.textContent = 'Job posted successfully!';
                responseDiv.style.color = 'green';
                opportunityForm.reset(); // Clear form

                // Forward job data to Project F for immediate notification
                await fetch('http://localhost:3006/api/communication', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(job),
                });
            } else {
                // Display server error message
                responseDiv.textContent = `Error: ${result.error}`;
                responseDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error posting job:', error);
            responseDiv.textContent = 'Failed to post the job.';
            responseDiv.style.color = 'red';
        }
    }

    // Attach event listener to form submission
    if (opportunityForm) {
        opportunityForm.addEventListener('submit', postOpportunity);
    }
});
