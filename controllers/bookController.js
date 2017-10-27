import Book from '../models/book';
import Author from '../models/author';
import Genre from '../models/genre';
import BookInstance from '../models/bookinstance';

import async from 'async';

export const index = (req, res) => {
  async.parallel(
    {
      book_count: callback => {
        Book.count(callback);
      },
      book_instance_count: callback => {
        BookInstance.count(callback);
      },
      book_instance_available_count: callback => {
        BookInstance.count({ status: 'Available' }, callback);
      },
      author_count: callback => {
        Author.count(callback);
      },
      genre_count: callback => {
        Genre.count(callback);
      },
    },
    (err, results) => {
      res.render('index', {
        title: 'School Library',
        error: err,
        data: results,
      });
    },
  );
};
// Display list of all books
export const book_list = (req, res) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, list_books) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book
export const book_detail = (req, res) => {
  async.parallel(
    {
      book: callback => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      book_instance: callback => {
        BookInstance.find({ book: req.params.id })
          //.populate('book')
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('book_detail', {
        title: 'Title',
        book: results.book,
        book_instances: results.book_instance,
      });
    },
  );
};

// Display book create form on GET
export const book_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST
export const book_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET
export const book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST
export const book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET
export const book_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST
export const book_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update POST');
};
