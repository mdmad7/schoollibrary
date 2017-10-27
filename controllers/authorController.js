import Author from '../models/author';

// Display list of all Authors
export const author_list = (req, res) => {
  res.send('NOT IMPLEMENTED: Author list');
};

// Display detail page for a specific Author
export const author_detail = (req, res) => {
  res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};

// Display Author create form on GET
export const author_create_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle Author create on POST
export const author_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET
export const author_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST
export const author_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET
export const author_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST
export const author_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update POST');
};
