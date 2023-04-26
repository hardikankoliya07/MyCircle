var express = require('express');
var router = express.Router();
const passport = require('passport')
const md5 = require('md5')
const UsersModel = require('../models/user')
const postControl = require('../controller/post');
const post = require('../models/post');

/** landing page */
router.get('/', async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/timeline')
  }
  const count = await post.countDocuments({ isArchive: false })
  const pageArr = [];
  for (let i = 0; i < Math.ceil(count / 4); i++) {
    pageArr.push(i + 1)
  }
  data = await postControl.allPosts(req)
  if (req.query.sortPost == 'date' || req.query.sortPost == 'title' || req.query.searchVal == "") {
    return res.render('partials/post/filter', {
      title: "Landing page",
      data: data,
      pages: pageArr,
      layout: 'blank'
    })
  } else {
    return res.render('landing', {
      title: "Landing page",
      data: data,
      pages: pageArr,
    })
  }
})

/** login */
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) return next(err)
    if (!user) {
      req.flash('error', info.message)
      return res.redirect('/login')
    }
    req.logIn(user, function (err) {
      if (err) return next(err)
      return res.redirect('/timeline');
    })
  })(req, res, next)
})

/** this is timeline page */
router.get('/login', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}, function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/timeline')
  }
  return res.render('auth/login', { title: 'Login', layout: 'auth' });
});

router.get('/register', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}, function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/timeline')
  }
  return res.render('auth/register', { title: 'Registration', layout: 'auth' });
});

router.post('/register', async function (req, res, next) {
  try {
    const data = {
      "first_name": req.body.first_name,
      "last_name": req.body.last_name,
      "email": req.body.email,
      "gender": req.body.gender,
      "password": md5(req.body.password),
      "profile": 'user.png'
    }
    await UsersModel.create(data);
    return res.send({
      type: "success",
      message: `User has been registered`
    })
  } catch (error) {
    return res.send({
      type: "error",
      message: error.message
    })
  }
})

router.get('/logout', (req, res, next) => {
  req.logOut();
  res.redirect('/')
})

router.get('/getEmail', async (req, res, next) => {
  let data = await UsersModel.countDocuments({ email: req.query.Remail });
  if (data) {
    return res.send(false)
  } else {
    return res.send(true)
  }
})

module.exports = router;
