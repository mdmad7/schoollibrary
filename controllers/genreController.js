import Genre from '../models/genre';
import Book from '../models/book';
import async from 'async';

// Display list of all Genre
export const genre_list = (req, res) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, list_genres) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific Genre
export const genre_detail = (req, res) => {
  async.parallel(
    {
      genre: callback => {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: callback => {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    },
  );
};

// Display Genre create form on GET
export const genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST
export const genre_create_post = (req, res) => {
  //Check that the name field is not empty
  req.checkBody('name', 'Genre name required').notEmpty();

  //Trim and escape the name field.
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  //Run the validators
  const errors = req.validationErrors();

  //Create a genre object with escaped and trimmed data.
  const genre = new Genre({ name: req.body.name });

  if (errors) {
    //If there are errors render the form again, passing the previously entered values and errors
    res.render('genre_form', {
      title: 'Create Genre',
      genre: genre,
      errors: errors,
    });
    return;
  } else {
    // Data from form is valid.
    //Check if Genre with same name already exists
    Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
      console.log('found_genre: ' + found_genre);
      if (err) {
        return next(err);
      }

      if (found_genre) {
        //Genre exists, redirect to its detail page
        res.redirect(found_genre.url);
      } else {
        genre.save(err => {
          if (err) {
            return next(err);
          }
          //Genre saved. Redirect to genre detail page
          res.redirect(genre.url);
        });
      }
    });
  }
};

// Display Genre delete form on GET
export const genre_delete_get = (req, res) => {
  async.parallel(
    {
      genre: callback => {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: callback => {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    },
  );
};

// Handle Genre delete on POST
export const genre_delete_post = (req, res) => {
  req.checkBody('genreid', 'Genre id must exist').notEmpty();

  async.parallel(
    {
      genre: callback => {
        Genre.findById(req.body.genreid).exec(callback);
      },
      genres_books: callback => {
        Book.find({ genre: req.body.genreid }, 'genre id').exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Success
      if (results.genres_books.length > 0) {
        //Genre has books. Render in same way as for GET route.
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genres_books: results.genres_books,
        });
        return;
      } else {
        //Author has no books. Delete object and redirect to the list of authors.
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
          if (err) {
            return next(err);
          }
          //Success - got to author list
          res.redirect('/catalog/genres');
        });
      }
    },
  );
};

// Display Genre update form on GET
export const genre_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST
export const genre_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
