// Books page functionality - API integration and search
class BookLibrary {
    constructor() {
        this.api = new OpenLibraryAPI();
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentQuery = '';
        this.searchTimeout = null;

        this.init();
    }

    init() {
        if (!this.searchInput) return;

        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        if (queryParam) {
            this.searchInput.value = queryParam;
            this.handleSearch();
        }

        // Add event listeners
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.handleSearch());
        }
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Add real-time search with debouncing
        this.searchInput.addEventListener('input', utils.debounce(() => {
            const query = this.searchInput.value.trim();
            if (query.length >= 3) {
                this.handleSearch();
            } else if (query.length === 0) {
                this.loadDefaultBooks();
            }
        }, 500));

        // Focus search input on page load
        this.searchInput.focus();
        
        // Load default books on page load if no URL query
        if (!queryParam) {
            this.loadDefaultBooks();
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            utils.showToast('Please enter a search term', 'warning');
            return;
        }

        if (query.length < 2) {
            utils.showToast('Search term must be at least 2 characters', 'warning');
            return;
        }

        this.currentQuery = query;
        await this.searchBooks(query);
    }

    async searchBooks(query) {
        try {
            UI.showLoading();

            let books;
            
            // First try to search in static books for immediate results
            const staticBooks = this.getStaticBooks();
            const staticResults = this.searchStaticBooks(staticBooks, query);
            
            if (staticResults.length > 0) {
                UI.displayResults(staticResults, query);
                utils.showToast(`Found ${staticResults.length} books`, 'success');
                return;
            }
            
            // If no static results, search via API
            if (query.toLowerCase().startsWith('title:')) {
                const title = query.substring(6).trim();
                books = await this.api.searchByTitle(title);
            } else if (query.toLowerCase().startsWith('author:') || query.toLowerCase().startsWith('by ')) {
                const author = query.replace(/^(author:|by )\s*/i, '').trim();
                books = await this.api.searchByAuthor(author);
            } else {
                books = await this.api.searchBooks(query);
            }
            
            // Display results
            UI.displayResults(books, query);
            utils.showToast(`Found ${books.length} books`, 'success');

        } catch (error) {
            console.error('Search error:', error);
            UI.showError('Failed to search books. Please check your connection and try again.');
            utils.showToast('Search failed. Please try again.', 'error');
        }
    }











    // Fetch detailed book information using ISBN
    async fetchBookDetailsByISBN(isbn) {
        try {
            const response = await fetch(`${this.baseURL}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const bookData = data[`ISBN:${isbn}`];
            
            if (bookData) {
                return {
                    description: bookData.excerpts?.[0]?.text || 'No description available.',
                    publish_date: bookData.publish_date || 'Unknown',
                    number_of_pages: bookData.number_of_pages || 'N/A',
                    subjects: bookData.subjects?.map(s => s.name || s).slice(0, 10) || [],
                    publishers: bookData.publishers?.map(p => p.name || p) || [],
                    authors: bookData.authors?.map(a => a.name || a) || []
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching book details:', error);
            return null;
        }
    }

    // Load static books on page load
    loadDefaultBooks() {
        const staticBooks = [
            {
                title: "The Great Gatsby",
                author_name: ["F. Scott Fitzgerald"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTQwYWYiLz48dGV4dCB4PSIxMjAiIHk9IjEyMCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRIRSBHUkVBVDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE2MCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkdBVFNCWTwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkYuIFNjb3R0IEZpdHpnZXJhbGQ8L3RleHQ+PC9zdmc+"
            },
            {
                title: "To Kill a Mockingbird",
                author_name: ["Harper Lee"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM2NjY2NjYiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UTyBLSUxMIEE8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIxNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TU9DS0lOR0JJUkQ8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IYXJwZXIgTGVlPC90ZXh0Pjwvc3ZnPg=="
            },
            {
                title: "1984",
                author_name: ["George Orwell"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNkYzI2MjYiLz48dGV4dCB4PSIxMjAiIHk9IjE0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xOTg0PC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R2VvcmdlIE9yd2VsbDwvdGV4dD48L3N2Zz4="
            },
            {
                title: "Pride and Prejudice",
                author_name: ["Jane Austen"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOGY0ZjAiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0iIzk5NjYzMyIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBSSURFIEFORDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE0MCIgZmlsbD0iIzk5NjYzMyIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBSRUpVRElDRTwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0iIzk5NjYzMyIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SmFuZSBBdXN0ZW48L3RleHQ+PC9zdmc+"
            },
            {
                title: "The Catcher in the Rye",
                author_name: ["J.D. Salinger"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZjZiMzUiLz48dGV4dCB4PSIxMjAiIHk9IjkwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRIRSBDQVRDSEVSPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMTIwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklOIFRIRSBSWUU8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNDAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5KLkQuIFNhbGluZ2VyPC90ZXh0Pjwvc3ZnPg=="
            },
            {
                title: "Lord of the Flies",
                author_name: ["William Golding"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMyMjQ3NTMiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MT1JEIE9GPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMTQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRIRSBGTElFUzwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldpbGxpYW0gR29sZGluZzwvdGV4dD48L3N2Zz4="
            },
            {
                title: "The Hobbit",
                author_name: ["J.R.R. Tolkien"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM2NjY2MDAiLz48dGV4dCB4PSIxMjAiIHk9IjE0MCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRIRSBIT0JCSVRQPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Si5SLlIuIFRvbGtpZW48L3RleHQ+PC9zdmc+"
            },
            {
                title: "Harry Potter",
                author_name: ["J.K. Rowling"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM3YzJkMTIiLz48dGV4dCB4PSIxMjAiIHk9IjEwMCIgZmlsbD0iI2ZmZGQwMCIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhBUlJZPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMTQwIiBmaWxsPSIjZmZkZDAwIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UE9UVEVSPCwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkouSy4gUm93bGluZzwvdGV4dD48L3N2Zz4="
            },
            {
                title: "Dune",
                author_name: ["Frank Herbert"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNkYTcwMDAiLz48dGV4dCB4PSIxMjAiIHk9IjE0MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1zaXplPSI2NCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRVTkU8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNDAiIGZpbGw9IiMzMzMzMzMiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZyYW5rIEhlcmJlcnQ8L3RleHQ+PC9zdmc+"
            },
            {
                title: "The Alchemist",
                author_name: ["Paulo Coelho"],
                cover_i: null,
                staticCover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI0MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM4N2NlZWIiLz48dGV4dCB4PSIxMjAiIHk9IjEyMCIgZmlsbD0iIzMzMzMzMyIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRIRTwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE2MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFMQ0hFTUlTVDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI0MCIgZmlsbD0iIzMzMzMzMyIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGF1bG8gQ29lbGhvPC90ZXh0Pjwvc3ZnPg=="
            }
        ];
        
        UI.displayResults(staticBooks, 'Featured Books');
    }

    // Get static books for search
    getStaticBooks() {
        return [
            { title: "The Great Gatsby", author_name: ["F. Scott Fitzgerald"] },
            { title: "To Kill a Mockingbird", author_name: ["Harper Lee"] },
            { title: "1984", author_name: ["George Orwell"] },
            { title: "Pride and Prejudice", author_name: ["Jane Austen"] },
            { title: "The Catcher in the Rye", author_name: ["J.D. Salinger"] },
            { title: "Lord of the Flies", author_name: ["William Golding"] },
            { title: "The Hobbit", author_name: ["J.R.R. Tolkien"] },
            { title: "Harry Potter", author_name: ["J.K. Rowling"] },
            { title: "Dune", author_name: ["Frank Herbert"] },
            { title: "The Alchemist", author_name: ["Paulo Coelho"] }
        ];
    }
    
    // Search static books
    searchStaticBooks(books, query) {
        const searchTerm = query.toLowerCase();
        return books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author_name.some(author => author.toLowerCase().includes(searchTerm))
        );
    }
}

// Initialize the book library when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on books page
    if (document.getElementById('searchInput')) {
        window.bookLibrary = new BookLibrary();
        
        // Add some sample search suggestions
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.setAttribute('placeholder', 'Try "Harry Potter", "Tolkien", or "Science Fiction"...');
        }
    }
});

// Export for global access
window.BookLibrary = BookLibrary;