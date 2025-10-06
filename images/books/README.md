# Book Cover Images

This directory contains SVG book cover images for the Library Management System catalog.

## Image Formats

- SVG files are used as the primary format for book covers
- The HTML includes fallback to external image URLs if the local images fail to load

## Book Covers

- great-gatsby.svg - Cover for "The Great Gatsby" by F. Scott Fitzgerald
- mockingbird.svg - Cover for "To Kill a Mockingbird" by Harper Lee
- 1984.svg - Cover for "1984" by George Orwell
- art-of-programming.svg - Cover for "The Art of Computer Programming" by Donald E. Knuth
- brief-history.svg - Cover for "A Brief History of Time" by Stephen Hawking
- republic.svg - Cover for "The Republic" by Plato
- book-template.svg - Generic book cover template

## Usage

These images are referenced in the catalog.html file with fallback to external URLs:

```html
<img src="images/books/book-name.svg" 
     onerror="this.src='https://fallback-url.jpg'" 
     alt="Book Title" 
     class="book-cover-img">
```