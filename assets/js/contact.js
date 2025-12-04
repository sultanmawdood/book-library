// Contact form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            let isValid = true;
            
            // Validate name
            if (!name) {
                document.getElementById('nameError').textContent = 'Name is required';
                isValid = false;
            } else if (name.length < 2) {
                document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
                isValid = false;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                document.getElementById('emailError').textContent = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            // Validate message
            if (!message) {
                document.getElementById('messageError').textContent = 'Message is required';
                isValid = false;
            } else if (message.length < 10) {
                document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
                isValid = false;
            }
            
            if (isValid) {
                // Hide form and show success message
                document.getElementById('contactForm').style.display = 'none';
                document.getElementById('successMessage').classList.remove('hidden');
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    document.getElementById('contactForm').reset();
                    document.getElementById('contactForm').style.display = 'block';
                    document.getElementById('successMessage').classList.add('hidden');
                }, 3000);
            }
        });
    }
});