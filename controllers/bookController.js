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
  //Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: callback => {
        Author.find(callback);
      },
      genres: callback => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres,
      });
    },
  );
};

// Handle book create on POST
export const book_create_post = (req, res) => {
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre:
      typeof req.body.genre === 'undefined' ? [] : req.body.genre.split(','),
  });

  const errors = req.validationErrors();
  if (errors) {
    // Some problems so we need to re-render our book

    //Get all authors and genres for form
    async.parallel(
      {
        authors: callback => {
          Author.find(callback);
        },
        genres: callback => {
          Genre.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }

        // Mark our selected genres as checked
        for (i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            //Current genre is selected. Set "checked" flag.
            results.genres[i].checked = 'true';
          }
        }

        res.render('book_form', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors,
        });
      },
    );
  } else {
    // Data from form is valid.
    // We could check if book exists already, but lets just save.

    book.save(err => {
      if (err) {
        return next(err);
      }
      //successful - redirect to new book record.
      res.redirect(book.url);
    });
  }
};

// Display book delete form on GET
export const book_delete_get = (req, res) => {
  async.parallel(
    {
      book: callback => {
        Book.findById(req.params.id).exec(callback);
      },
      book_instance: callback => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('book_delete', {
        title: 'Delete Book',
        book: results.book,
        book_instances: results.book_instance,
      });
    },
  );
};

// Handle book delete on POST
export const book_delete_post = (req, res) => {
  req.checkBody('bookid', 'Book id must exist').notEmpty();
  async.parallel(
    {
      book: callback => {
        Book.findById(req.body.bookid).exec(callback);
      },
      book_instance: callback => {
        BookInstance.find(
          { book_instance: req.body.bookid },
          'title summary',
        ).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Success
      if (results.book_instance.length > 0) {
        //Book has instances. Render in same way as for GET route.
        res.render('book_delete', {
          title: 'Delete Book',
          book: results.book,
          book_instance: results.book_instance,
        });
        return;
      } else {
        //Author has no books. Delete object and redirect to the list of authors.
        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
          if (err) {
            return next(err);
          }
          //Success - got to author list
          res.redirect('/catalog/books');
        });
      }
    },
  );
};

// Display book update form on GET
export const book_update_get = (req, res) => {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Get book, authors and genres for form
  async.parallel(
    {
      book: callback => {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      authors: callback => {
        Author.find(callback);
      },
      genres: callback => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Mark our selected genres as checked
      for (
        let all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          let book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ==
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = 'true';
          }
        }
      }
      res.render('book_form', {
        title: 'Update Book',
        authors: results.authors,
        genres: results.genres,
        book: results.book,
      });
    },
  );
};

// Handle book update on POST
export const book_update_post = (req, res) => {
  //Sanitize id passed in.
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Check other data
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  // req.sanitize('genre').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  // req.sanitize('genre').trim();

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
    _id: req.params.id, //This is required, or a new ID will be assigned!
  });

  const errors = req.validationErrors();
  if (errors) {
    // Re-render book with error information
    // Get all authors and genres for form
    async.parallel(
      {
        authors: callback => {
          Author.find(callback);
        },
        genres: callback => {
          Genre.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }

        // Mark our selected genres as checked
        for (i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors,
        });
      },
    );
  } else {
    // Data from form is valid. Update the record.
    Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
      if (err) {
        return next(err);
      }
      //successful - redirect to book detail page.
      res.redirect(thebook.url);
    });
  }
};
