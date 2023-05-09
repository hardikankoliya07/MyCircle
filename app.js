require('custom-env').env();
const createError = require('http-errors');
const express = require('express');
const path = require('path');

const logger = require('morgan');
const moment = require('moment')
const { create } = require('express-handlebars')
const dbConfig = require('./config')

const helper = require('./helper/helper')

/** Routes */
const indexRouter = require('./routes/index');
const timeline = require('./routes/timeline');
const posts = require('./routes/post')
const users = require('./routes/user')
const report = require('./routes/report')
const notification = require('./routes/notification')


const helpers = require('handlebars-helpers')();

const app = express();

/** database configuration */
dbConfig()

/** Models */
const Post = require('./models/post')
const SavedPost = require('./models/savedPost')
const Report = require('./models/report')
const User = require('./models/user');

// view engine setup
const hbs = create({
  extname: '.hbs',
  helpers: {
    ...helpers,
    formatDate: function (datetime) { /** use moment for formate date and time */
      return moment(datetime).format('LLLL');
    },
    commentTime: function (datetime) { /** use moment for formate date and time */
      return moment(datetime, "YYYYMMDD").fromNow();
    },
    isAuthUser: function (authUser, postUser, options) {
      if (authUser == postUser) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    isAuthUserSave: function (authUser, postUser, options) {
      if (authUser == postUser) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    title: function (title, options) {
      if (title == "Timeline") {
        return options.fn(this);
      }
    },
    ifCond: function (current, pages, options) {
      if (current == pages) {
        return options.fn(this);
      }
    },
    checkCommentDelete: function (authUser, postUser, commentBy, options) {
      if (authUser == postUser || authUser == commentBy) {
        return options.fn(this);
      }
    }
  }
})
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/** auth helper */
helper.login(app)

/** store auth user in locals */
app.use(helper.authUser)

/** add flash message */
app.use(helper.flash)

app.use('/', indexRouter);

/** check authentication user login */
app.use(helper.authHelper)

/** other router */
app.use('/timeline', timeline);
app.use('/user', users);
app.use('/post', posts)
app.use('/report', report)
app.use('/notification', notification)

/** CronJob : every 1 minute delete file */
const CronJob = require('cron').CronJob;
new CronJob(
  '*/15 * * * * *',
  async function () {
    try {
      const userList = await User.find({}, { _id: 1 })
      for (const users of userList) {
        const userPost = await Post.find({ postBy: users._id, isArchive: false }, { _id: 1, postBy: 1 })
        const userSavedPost = await SavedPost.countDocuments({ saveBy: users._id }, { _id: 1, postBy: 1, saveBy: 1 })
        const otherSavedPost = await SavedPost.countDocuments({ saveBy: { $ne: users._id }, postId: { $in: userPost.map((post) => post._id) } });
        let data = {
          userId: users._id,
          TotalPost: userPost.length,
          userSaved: userSavedPost,
          otherSaved: otherSavedPost
        }
        await Report.updateOne({ userId: users._id }, { $set: data }, { upsert: true })
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  null,
  true
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
