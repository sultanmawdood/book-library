// Main JavaScript file for common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
});

// Utility functions
const utils = {
    // Show element
    show: function(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },

    // Hide element
    hide: function(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },

    // Toggle element visibility
    toggle: function(element) {
        if (element) {
            element.classList.toggle('hidden');
        }
    },

    // Debounce function for search input
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format date
    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    },

    // Truncate text
    truncateText: function(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Show toast notification
    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Load trending books on homepage
if (document.getElementById('trendingBooks')) {
    loadTrendingBooks();
}

// Function to load trending books
function loadTrendingBooks() {
    const staticBooks = [
        {
            title: "What I learned......",
            author_name: ["L.E Bowman"],
            staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMyMjQ3NTMiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XSEFUIEk8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIxMzAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TEVBUk5FRDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE3MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZST00gVEhFPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjAwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRSRUVTPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjUwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TC5FLiBCT1dNQU48L3RleHQ+PC9zdmc+"
        },
        {
            title: "Made to Stick",
            author_name: ["Chip Heath & Dan Heath"],
            staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNTk1MDAiLz48dGV4dCB4PSIxMjAiIHk9IjgwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V2h5IFNvbWUgSWRlYXMgU3Vydml2ZTwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmFuZCBPdGhlcnMgRGllPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMTUwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1BREUgdG88L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIxOTAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1RJQ0s8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DaGlwIEhlYXRoICYgRGFuIEhlYXRoPC90ZXh0Pjwvc3ZnPg=="
        },
        {
            title: "Atomic Habits",
            author_name: ["James Clear"],
            staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSIxMjAiIHk9IjUwIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UaW55IENoYW5nZXMsPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iNzAiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJlbWFya2FibGUgUmVzdWx0czwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjEyMCIgZmlsbD0iI2Q0YWY3YSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkF0b21pYzwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE3MCIgZmlsbD0iI2Q0YWY3YSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhhYml0czwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjIyMCIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkphbWVzIENsZWFyPC90ZXh0Pjwvc3ZnPg=="
        },
        {
            title: "Muscle",
            author_name: ["Alan Trotter"],
            staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZjZiMzUiLz48dGV4dCB4PSIxMjAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NVVNDTEU8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BTEFOIFRST1RURU88L3RleHQ+PC9zdmc+"
        },
        {
            title: "Happiness by Design",
            author_name: ["Paul Dolan"],
            staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM4N2NlZWIiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhhcHBpbmVzczwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE0MCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmJ5IERlc2lnbjwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBhdWwgRG9sYW48L3RleHQ+PC9zdmc+"
        }
    ];
    
    const container = document.getElementById('trendingBooks');
    if (container) {
        container.innerHTML = staticBooks.map(book => `
            <div class="book-showcase-item">
                <img src="${book.staticCover}" alt="${book.title}" class="book-showcase-cover">
                <h4>${utils.truncateText(book.title, 30)}</h4>
                <p>${book.author_name[0]}</p>
                <button class="btn btn-primary" onclick="window.location.href='books.html'">Add to Cart</button>
            </div>
        `).join('');
    }
}

// Function to search by genre
function searchGenre(genre) {
    window.location.href = `books.html?q=${encodeURIComponent(genre)}`;
}

// Export utils for use in other files
window.utils = utils;
window.searchGenre = searchGenre;