import BookInstance from '../models/bookinstance';
import Book from '../models/book';

import async from 'async';

// Display list of all BookInstances
export const bookinstance_list = (req, res) => {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstances) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance
export const bookinstance_detail = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('bookinstance_detail', {
        title: 'Book:',
        bookinstance: bookinstance,
      });
    });
};

// Display BookInstance create form on GET
export const bookinstance_create_get = (req, res) => {
  Book.find({}, 'title').exec((err, books) => {
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST
export const bookinstance_create_post = (req, res) => {
  req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req
    .checkBody('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();

  const bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
  });

  const errors = req.validationErrors();
  if (errors) {
    Book.find({}, 'title').exec((err, books) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: books,
        selected_book: bookinstance.book._id,
        errors: errors,
        bookinstance: bookinstance,
      });
    });
    return;
  } else {
    // Data from form is valid

    bookinstance.save(err => {
      if (err) {
        return next(err);
      }
      //successful - redirect to new book-instance record.
      res.redirect(bookinstance.url);
    });
  }
};

// Display BookInstance delete form on GET
export const bookinstance_delete_get = (req, res) => {
  BookInstance.findById(req.params.id).exec((err, bookinstance) => {
    if (err) {
      return next(err);
    }

    //Successful , so render
    res.render('bookinstance_delete', {
      title: 'Delete Book Instance',
      bookinstance: bookinstance,
    });
  });
};

// Handle BookInstance delete on POST
export const bookinstance_delete_post = (req, res) => {
  req.checkBody('bookinstanceid', 'Book Instance id must exist').notEmpty();

  //Delete object and redirect to the list of bookinstances.
  BookInstance.findByIdAndRemove(
    req.body.bookinstanceid,
    function deleteBookInstance(err) {
      if (err) {
        return next(err);
      }
      //Success - got to author list
      res.redirect('/catalog/bookinstances');
    },
  );
};

// Display BookInstance update form on GET
export const bookinstance_update_get = (req, res) => {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  //Get book, authors and genres for form
  async.parallel(
    {
      bookinstance: callback => {
        BookInstance.findById(req.params.id)
          .populate('book')
          .exec(callback);
      },
      books: callback => {
        Book.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render('bookinstance_form', {
        title: 'Update  BookInstance',
        book_list: results.books,
        selected_book: results.bookinstance.book._id,
        bookinstance: results.bookinstance,
      });
    },
  );
};

// Handle bookinstance update on POST
export const bookinstance_update_post = (req, res) => {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true });
  // .isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();

  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
    _id: req.params.id,
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find({}, 'title').exec(function(err, books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        book_list: books,
        selected_book: bookinstance.book._id,
        errors: errors,
        bookinstance: bookinstance,
      });
    });
    return;
  } else {
    // Data from form is valid
    BookInstance.findByIdAndUpdate(
      req.params.id,
      bookinstance,
      {},
      (err, thebookinstance) => {
        if (err) {
          return next(err);
        }
        //successful - redirect to genre detail page.
        res.redirect(thebookinstance.url);
      },
    );
  }
};
