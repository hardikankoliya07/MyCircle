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

/** user login post api */
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

/** user login page */
router.get('/login', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}, function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/timeline')
  }
  return res.render('auth/login', { title: 'Login', layout: 'auth' });
});

/** registration render */
router.get('/register', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}, function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/timeline')
  }
  return res.render('auth/register', { title: 'Registration', layout: 'auth' });
});

/** post api for registration */
router.post('/register', async function (req, res, next) {
  try {
    const { first_name, last_name, email, gender, password } = req.body;
    if (first_name == '' || first_name == null) {
      throw new Error('Enter valid first name')
    } else if (last_name == '' || last_name == null) {
      throw new Error('Enter valid last name')
    } else if (email == '' || email == null) {
      throw new Error('Enter valid email')
    } else if (gender == '' || gender == null) {
      throw new Error('Select your gender')
    } else if (password == '' || password == null) {
      throw new Error('Enter Valid password')
    } else {
      const data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "gender": gender,
        "password": md5(password),
        "profile": ''
      }
      // await UsersModel.create(data);
    }
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

/** logout user */
router.get('/logout', (req, res, next) => {
  try {
    req.logOut();
    res.redirect('/')
  } catch (error) {
    return res.send({
      type: "error",
      message: "Something when wrong"
    })
  }
})

/** registration time check the user email is already exist or not */
router.get('/getEmail', async (req, res, next) => {
  try {
    let email = req.query.Remail.trim()
    let data = await UsersModel.countDocuments({ email: email });
    if (data) {
      return res.send(false)
    } else {
      return res.send(true)
    }
  } catch (error) {
    return res.send({
      type: "error",
      message: "Something when wrong"
    })
  }
})

module.exports = router;
