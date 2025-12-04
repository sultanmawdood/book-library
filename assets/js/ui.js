// UI helper functions for the Book Library
const UI = {
    // Create book card element
    createBookCard: function(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.setAttribute('data-book-key', book.key || '');

        // Get book cover URL using Large size for better quality
        const coverUrl = this.getBookCoverUrl(book, 'L');
        
        // Get authors string
        const authors = this.formatAuthors(book.author_name);
        
        // Get publisher
        const publisher = book.publisher && book.publisher[0] ? book.publisher[0] : 'Unknown Publisher';
        
        // Get publication year
        const year = book.first_publish_year || 'Unknown';

        card.innerHTML = `
            <div class="book-cover-container">
                ${coverUrl ? 
                    `<img src="${coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">` :
                    `<div class="no-cover">
                        <i class="fas fa-book"></i>
                        <span>No Cover</span>
                    </div>`
                }
            </div>
            <div class="book-info">
                <h3 class="book-title">${utils.truncateText(book.title, 50)}</h3>
                <p class="book-author">${authors}</p>
                <div class="book-actions">
                    <button class="borrow-btn">Borrow</button>
                    <button class="add-cart-btn">Add to Cart</button>
                </div>
            </div>
        `;

        // Add click event to open modal (only on cover/title)
        const coverContainer = card.querySelector('.book-cover-container');
        const titleElement = card.querySelector('.book-title');
        
        [coverContainer, titleElement].forEach(element => {
            element.addEventListener('click', () => {
                this.openBookModal(book);
            });
        });
        
        // Add button event listeners
        const borrowBtn = card.querySelector('.borrow-btn');
        const addCartBtn = card.querySelector('.add-cart-btn');
        
        borrowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            utils.showToast('Book borrowed successfully!', 'success');
        });
        
        addCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            utils.showToast('Book added to cart!', 'success');
        });

        return card;
    },

    // Get book cover URL using Open Library Covers API or static cover
    getBookCoverUrl: function(book, size = 'L') {
        // Use static cover if available
        if (book.staticCover) {
            return book.staticCover;
        }
        // Use cover_i (cover ID) for best quality
        if (book.cover_i) {
            return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
        }
        // Fallback to ISBN
        if (book.isbn && book.isbn[0]) {
            return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-${size}.jpg`;
        }
        return null;
    },

    // Format authors array
    formatAuthors: function(authors) {
        if (!authors || authors.length === 0) return 'Unknown Author';
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return authors.join(' & ');
        return `${authors[0]} & ${authors.length - 1} others`;
    },

    // Open book details modal
    openBookModal: function(book) {
        const modal = document.getElementById('bookModal');
        if (!modal) return;

        // Populate modal with book data
        this.populateModal(book);
        
        // Show modal
        utils.show(modal);
        document.body.style.overflow = 'hidden';

        // Fetch additional details if available
        if (book.isbn && book.isbn[0]) {
            this.fetchBookDetails(book.isbn[0]);
        }
    },

    // Close book modal
    closeBookModal: function() {
        const modal = document.getElementById('bookModal');
        if (modal) {
            utils.hide(modal);
            document.body.style.overflow = '';
        }
    },

    // Populate modal with book data
    populateModal: function(book) {
        // Set cover image using Open Library Covers API
        const coverImg = document.getElementById('modalBookCover');
        const coverUrl = this.getBookCoverUrl(book, 'L'); // Use Large size for modal
        if (coverImg) {
            if (coverUrl) {
                coverImg.src = coverUrl;
                coverImg.alt = book.title;
                // Handle image load errors
                coverImg.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xNTAgMTgwQzE1Ni42MjcgMTgwIDE2MiAxNzQuNjI3IDE2MiAxNjhDMTYyIDE2MS4zNzMgMTU2LjYyNyAxNTYgMTUwIDE1NkMxNDMuMzczIDE1NiAxMzggMTYxLjM3MyAxMzggMTY4QzEzOCAxNzQuNjI3IDE0My4zNzMgMTgwIDE1MCAxODBaIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0xNzAgMjAwSDE3NlYyMjBIMTcwVjIwMFoiIGZpbGw9IiM5NEEzQjgiLz4KPHA+Tm8gQ292ZXI8L3A+Cjwvc3ZnPgo=';
                    this.alt = 'No cover available';
                };
            } else {
                coverImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xNTAgMTgwQzE1Ni42MjcgMTgwIDE2MiAxNzQuNjI3IDE2MiAxNjhDMTYyIDE2MS4zNzMgMTU2LjYyNyAxNTYgMTUwIDE1NkMxNDMuMzczIDE1NiAxMzggMTYxLjM3MyAxMzggMTY4QzEzOCAxNzQuNjI3IDE0My4zNzMgMTgwIDE1MCAxODBaIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0xNzAgMjAwSDE3NlYyMjBIMTcwVjIwMFoiIGZpbGw9IiM5NEEzQjgiLz4KPHA+Tm8gQ292ZXI8L3A+Cjwvc3ZnPgo=';
                coverImg.alt = 'No cover available';
            }
        }

        // Set title
        const titleEl = document.getElementById('modalBookTitle');
        if (titleEl) titleEl.textContent = book.title;

        // Set author
        const authorEl = document.getElementById('modalBookAuthor');
        if (authorEl) authorEl.textContent = this.formatAuthors(book.author_name);

        // Set publisher
        const publisherEl = document.getElementById('modalBookPublisher');
        if (publisherEl) {
            publisherEl.textContent = book.publisher && book.publisher[0] ? book.publisher[0] : 'N/A';
        }

        // Set publication date
        const dateEl = document.getElementById('modalBookDate');
        if (dateEl) {
            dateEl.textContent = book.first_publish_year ? book.first_publish_year.toString() : 'N/A';
        }

        // Set pages
        const pagesEl = document.getElementById('modalBookPages');
        if (pagesEl) {
            pagesEl.textContent = book.number_of_pages_median ? book.number_of_pages_median.toString() : 'N/A';
        }

        // Set ISBN
        const isbnEl = document.getElementById('modalBookISBN');
        if (isbnEl) {
            isbnEl.textContent = book.isbn && book.isbn[0] ? book.isbn[0] : 'N/A';
        }

        // Set description (initially empty, will be filled by API call)
        const descEl = document.getElementById('modalBookDescription');
        if (descEl) {
            descEl.textContent = 'Loading description...';
        }

        // Set subjects
        const subjectsEl = document.getElementById('modalBookSubjects');
        if (subjectsEl) {
            if (book.subject && book.subject.length > 0) {
                subjectsEl.innerHTML = book.subject.slice(0, 10).map(subject => 
                    `<span class="subject-tag">${subject}</span>`
                ).join('');
            } else {
                subjectsEl.innerHTML = '<span class="subject-tag">No subjects available</span>';
            }
        }
    },

    // Fetch additional book details using Open Library Book Details API
    fetchBookDetails: async function(isbn) {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const data = await response.json();
            
            const bookData = data[`ISBN:${isbn}`];
            if (bookData) {
                // Update description
                const descEl = document.getElementById('modalBookDescription');
                if (descEl) {
                    const description = bookData.excerpts?.[0]?.text || 
                                      bookData.description?.value || 
                                      bookData.description || 
                                      'No description available.';
                    descEl.textContent = description;
                }

                // Update publication date
                const dateEl = document.getElementById('modalBookDate');
                if (dateEl && bookData.publish_date) {
                    dateEl.textContent = utils.formatDate(bookData.publish_date);
                }

                // Update number of pages
                const pagesEl = document.getElementById('modalBookPages');
                if (pagesEl && bookData.number_of_pages) {
                    pagesEl.textContent = bookData.number_of_pages.toString();
                }

                // Update subjects
                const subjectsEl = document.getElementById('modalBookSubjects');
                if (subjectsEl && bookData.subjects) {
                    const subjects = bookData.subjects.map(s => s.name || s).slice(0, 10);
                    if (subjects.length > 0) {
                        subjectsEl.innerHTML = subjects.map(subject => 
                            `<span class="subject-tag">${subject}</span>`
                        ).join('');
                    }
                }

                // Update publishers
                const publisherEl = document.getElementById('modalBookPublisher');
                if (publisherEl && bookData.publishers) {
                    const publisher = bookData.publishers[0]?.name || bookData.publishers[0] || 'N/A';
                    publisherEl.textContent = publisher;
                }
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            const descEl = document.getElementById('modalBookDescription');
            if (descEl) {
                descEl.textContent = 'Description not available.';
            }
        }
    },

    // Display search results
    displayResults: function(books, query) {
        const booksGrid = document.getElementById('booksGrid');
        const resultsHeader = document.getElementById('resultsHeader');
        const resultsCount = document.getElementById('resultsCount');

        if (!booksGrid) return;

        // Clear previous results
        booksGrid.innerHTML = '';

        if (books.length === 0) {
            utils.show(document.getElementById('noResults'));
            utils.hide(resultsHeader);
            return;
        }

        // Show results header
        utils.show(resultsHeader);
        if (resultsCount) {
            resultsCount.textContent = `Found ${books.length} books for "${query}"`;
        }

        // Create and append book cards
        books.forEach(book => {
            const card = this.createBookCard(book);
            booksGrid.appendChild(card);
        });

        // Hide no results message
        utils.hide(document.getElementById('noResults'));
    },

    // Show loading state
    showLoading: function() {
        utils.show(document.getElementById('loadingSpinner'));
        utils.hide(document.getElementById('errorMessage'));
        utils.hide(document.getElementById('noResults'));
        utils.hide(document.getElementById('resultsHeader'));
        
        const booksGrid = document.getElementById('booksGrid');
        if (booksGrid) booksGrid.innerHTML = '';
    },

    // Show error state
    showError: function(message = 'Something went wrong. Please try again.') {
        utils.hide(document.getElementById('loadingSpinner'));
        utils.show(document.getElementById('errorMessage'));
        utils.hide(document.getElementById('noResults'));
        utils.hide(document.getElementById('resultsHeader'));
        
        const errorEl = document.querySelector('#errorMessage p');
        if (errorEl) errorEl.textContent = message;
        
        const booksGrid = document.getElementById('booksGrid');
        if (booksGrid) booksGrid.innerHTML = '';
    },

    // Hide all states
    hideAllStates: function() {
        utils.hide(document.getElementById('loadingSpinner'));
        utils.hide(document.getElementById('errorMessage'));
        utils.hide(document.getElementById('noResults'));
        utils.hide(document.getElementById('resultsHeader'));
    }
};

// Initialize modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking close button
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', UI.closeBookModal);
    }

    // Close modal when clicking overlay
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', UI.closeBookModal);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            UI.closeBookModal();
        }
    });
});

// Export UI object
window.UI = UI;