// Add an event listener to ensure the DOM is fully loaded before running the JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Your existing code...
    // Add your code here
    const swipeToggles = document.querySelectorAll('.swipe-toggle');

    swipeToggles.forEach(toggle => {
        toggle.addEventListener('click', async () => {
            // Rest of your code...
            // Get the user ID from the data attribute
            console.log('button clicked');
            const userId = toggle.getAttribute('data-userid');

            // Get the hidden input field containing the isActive status
            const isActiveInput = toggle.querySelector('.is-active');

            // Toggle the isActive status visually
            isActiveInput.value = isActiveInput.value === 'true' ? 'false' : 'true';

            try {
                // Make an AJAX request to your server to toggle the user's isActive status
                const response = await fetch(`/toggle-user-status?id=${userId}`, {
                    method: 'POST', // Use POST for data modification
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isActive: isActiveInput.value === 'true' }),
                });

                if (response.ok) {
                    // Handle success response here if needed
                    console.log('User status toggled successfully');
                } else {
                    // Handle errors here
                    console.error('Failed to toggle user status');
                    // You may want to revert the visual toggle state here on error
                    isActiveInput.value = isActiveInput.value === 'true' ? 'false' : 'true';
                }
            } catch (error) {
                // Handle network errors
                console.error('Network error:', error);
                // You may want to revert the visual toggle state here on error
                isActiveInput.value = isActiveInput.value === 'true' ? 'false' : 'true';
            }
        });
    });
});
