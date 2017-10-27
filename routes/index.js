import { Router } from 'express';
const router = new Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  // res.render('index', { title: 'Express' });
  res.redirect('/catalog');
});

export default router;
