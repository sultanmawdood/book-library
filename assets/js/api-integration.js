// Complete Open Library API Integration
class OpenLibraryAPI {
    constructor() {
        this.baseURL = 'https://openlibrary.org';
        this.coversURL = 'https://covers.openlibrary.org';
    }

    // 1. Search Books API - https://openlibrary.org/search.json?q=SEARCH_QUERY
    async searchBooks(query) {
        try {
            const searchURL = `${this.baseURL}/search.json?q=${encodeURIComponent(query)}&limit=20`;
            const response = await fetch(searchURL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processSearchResults(data);
        } catch (error) {
            console.error('Search API error:', error);
            throw error;
        }
    }

    // Search by title specifically
    async searchByTitle(title) {
        try {
            const searchURL = `${this.baseURL}/search.json?title=${encodeURIComponent(title)}&limit=20`;
            const response = await fetch(searchURL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processSearchResults(data);
        } catch (error) {
            console.error('Title search API error:', error);
            throw error;
        }
    }

    // Search by author specifically
    async searchByAuthor(author) {
        try {
            const searchURL = `${this.baseURL}/search.json?author=${encodeURIComponent(author)}&limit=20`;
            const response = await fetch(searchURL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processSearchResults(data);
        } catch (error) {
            console.error('Author search API error:', error);
            throw error;
        }
    }

    // 2. Book Details API - https://openlibrary.org/api/books?bibkeys=ISBN:ISBN_NUMBER&format=json&jscmd=data
    async getBookDetailsByISBN(isbn) {
        try {
            const detailsURL = `${this.baseURL}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
            const response = await fetch(detailsURL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const bookData = data[`ISBN:${isbn}`];
            
            if (bookData) {
                return {
                    description: this.extractDescription(bookData),
                    publish_date: bookData.publish_date || 'Unknown',
                    number_of_pages: bookData.number_of_pages || 'N/A',
                    subjects: this.extractSubjects(bookData),
                    publishers: this.extractPublishers(bookData),
                    authors: this.extractAuthors(bookData),
                    isbn: isbn,
                    title: bookData.title || 'Unknown Title'
                };
            }
            
            return null;
        } catch (error) {
            console.error('Book details API error:', error);
            throw error;
        }
    }

    // 3. Book Covers API - https://covers.openlibrary.org/b/id/COVER_ID-L.jpg
    getBookCoverURL(coverId, size = 'L') {
        if (!coverId) return null;
        return `${this.coversURL}/b/id/${coverId}-${size}.jpg`;
    }

    // Get cover by ISBN
    getBookCoverByISBN(isbn, size = 'L') {
        if (!isbn) return null;
        return `${this.coversURL}/b/isbn/${isbn}-${size}.jpg`;
    }

    // Process search results
    processSearchResults(data) {
        if (!data.docs || data.docs.length === 0) {
            return [];
        }

        return data.docs.map(book => ({
            key: book.key,
            title: book.title || 'Unknown Title',
            author_name: book.author_name || ['Unknown Author'],
            publisher: book.publisher || ['Unknown Publisher'],
            first_publish_year: book.first_publish_year || 'Unknown',
            isbn: book.isbn || [],
            cover_i: book.cover_i,
            subject: book.subject || [],
            number_of_pages_median: book.number_of_pages_median,
            language: book.language || ['en'],
            edition_count: book.edition_count || 1
        }));
    }

    // Extract description from book data
    extractDescription(bookData) {
        if (bookData.excerpts && bookData.excerpts[0]) {
            return bookData.excerpts[0].text;
        }
        if (bookData.description) {
            if (typeof bookData.description === 'string') {
                return bookData.description;
            }
            if (bookData.description.value) {
                return bookData.description.value;
            }
        }
        return 'No description available.';
    }

    // Extract subjects from book data
    extractSubjects(bookData) {
        if (!bookData.subjects) return [];
        return bookData.subjects.map(subject => {
            if (typeof subject === 'string') return subject;
            return subject.name || subject;
        }).slice(0, 10);
    }

    // Extract publishers from book data
    extractPublishers(bookData) {
        if (!bookData.publishers) return [];
        return bookData.publishers.map(publisher => {
            if (typeof publisher === 'string') return publisher;
            return publisher.name || publisher;
        });
    }

    // Extract authors from book data
    extractAuthors(bookData) {
        if (!bookData.authors) return [];
        return bookData.authors.map(author => {
            if (typeof author === 'string') return author;
            return author.name || author;
        });
    }

    // Validate ISBN format
    isValidISBN(isbn) {
        const cleaned = isbn.replace(/[-\s]/g, '');
        return /^(\d{9}[\dX]|\d{13})$/.test(cleaned);
    }

    // Format authors for display
    formatAuthors(authors) {
        if (!authors || authors.length === 0) return 'Unknown Author';
        if (authors.length === 1) return authors[0];
        if (authors.length === 2) return authors.join(' & ');
        return `${authors[0]} & ${authors.length - 1} others`;
    }
}

// Export the API class
window.OpenLibraryAPI = OpenLibraryAPI;

// Example usage:
/*
const api = new OpenLibraryAPI();

// Search for books
api.searchBooks('harry potter').then(books => {
    console.log('Search results:', books);
});

// Search by title
api.searchByTitle('The Great Gatsby').then(books => {
    console.log('Title search results:', books);
});

// Search by author
api.searchByAuthor('Stephen King').then(books => {
    console.log('Author search results:', books);
});

// Get book details by ISBN
api.getBookDetailsByISBN('9780451526533').then(details => {
    console.log('Book details:', details);
});

// Get book cover URL
const coverURL = api.getBookCoverURL('12345', 'L'); // Large size
console.log('Cover URL:', coverURL);
*/