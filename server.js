import { parse } from 'url';
import path from 'path';
import http from 'http'; 
import express from 'express'
import fs, { read } from 'fs'
import cookieParser from 'cookie-parser';
import pg from 'pg';
import crypto from 'crypto';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
//const pgSession = connectPg(session);

//Fake data for posts, this is the format they will use
let fakedatapostslist1 = {
  '1668023535539': {
    PostID: 1668023535539,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:15',
    Title: 'Hello There!',
    Body: "Check out my new beat, it's pretty cool!",
    Likes: 12,
    Dislikes: 2,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023552011': {
    PostID: 1668023552011,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:31',
    Title: 'Sup guys!',
    Body: 'Created a new beat check it out!',
    Likes: 34,
    Dislikes: 4,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023578899': {
    PostID: 1668023578899,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:58',
    Title: 'Made a new beat',
    Body: '',
    Likes: 25,
    Dislikes: 7,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023596460': {
    PostID: 1668023596460,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:16',
    Title: "Think you'll like this one",
    Body: '',
    Likes: 64,
    Dislikes: 12,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023611412': {
    PostID: 1668023611412,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:31',
    Title: 'Check this out',
    Body: '',
    Likes: 42,
    Dislikes: 0,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023625281': {
    PostID: 1668023625281,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:45',
    Title: "You won't regret clicking",
    Body: '',
    Likes: 32,
    Dislikes: 5,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023635377': {
    PostID: 1668023635377,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:55',
    Title: 'WOOOOOOOOO',
    Body: '',
    Likes: 276,
    Dislikes: 34,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023784829': {
    PostID: 1668023784829,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:56:24',
    Title: 'This is really good!',
    Body: '',
    Likes: 12,
    Dislikes: 1,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023806321': {
    PostID: 1668023806321,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:56:46',
    Title: 'Click here',
    Body: 'made a new beat check it out lemme know what you think',
    Likes: 2,
    Dislikes: 0,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023829415': {
    PostID: 1668023829415,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:57:9',
    Title: 'sup sup',
    Body: "hey guys, spend awhile on this one, think you'll like it",
    Likes: 1,
    Dislikes: 1,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  }
}

let fakedatapostslist2 = {
  '1668023535539': {
    PostID: 1668023535539,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:15',
    Title: 'Hello There!',
    Body: "Check out my new beat, it's pretty cool!",
    Likes: 12,
    Dislikes: 2,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023552011': {
    PostID: 1668023552011,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:31',
    Title: 'Sup guys!',
    Body: 'Created a new beat check it out!',
    Likes: 34,
    Dislikes: 4,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023578899': {
    PostID: 1668023578899,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:58',
    Title: 'Made a new beat',
    Body: '',
    Likes: 25,
    Dislikes: 7,
    Replies: [{"NewUsername":"Nice!"},{"OtherUsername":"Cool!"}],
    AudioFile: './uploads/cantina.txt'
  }
}

function getSecret(key) {
  return process.env[key] || require('secrets.json')[key];
}

function basicGetHandle(req, res) {
    console.log("Redirecting");
    res.redirect('/frontpage');                                                                              
}

// ya boy is vulnerable to sql injection
function userRegister(req, res) {
  console.log("Registering User");
  // check if user exists in database
  // if so, alert user that username is taken
  // if not, add user to database
  console.log(req.body);
  const username = req.body.username;
  //res.writeHead(200, {'Content-Type': 'text/html'});

  const connectionString = getSecret('DATABASE_URL');
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect();
  client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      console.error(err.stack);
      res.send('<p>error1, please try again</p>');
      return;
    }
    
    if (result.rows.length) {
      // user exists
      res.write(`<h1>Username already exists</h1>`);
      return;
    }

    // user does not exist
    // create salt, hash password, add to database
    const salt = crypto.randomBytes(64).toString('ascii');
    const hash = crypto.createHash('sha256').update(salt + req.body.password).digest('ascii');
    console.log('salt: ' + salt);
    console.log('hash: ' + hash);
    client.query('INSERT INTO users (username, salt, hash) VALUES ($1, $2, $3)', [username, salt, hash], (err, result) => {
      if (err) {
        console.error(err.stack);
        res.write('<p>error2, please try again</p>');
        return;
      }
      res.write(String.raw`<h1>Succesfully registered ${username}</h1>`);
    });
  });
  //res.end();
}
function userLogin(req, res) {
  console.log('logging in user');
  res.writeHead(200, {'Content-Type': 'text/html'});
  const connectionString = getSecret('DATABASE_URL');
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect();
  client.query('SELECT * FROM users WHERE username = $1', [req.body.username], (err, result) => {
    if (err) {
      console.error(err.stack);
      res.write('<p>There was an error, please try again</p>');
      return;
    }
    if (!result.rows.length) {
      res.write('<p>Username does not exist</p>');
      return;
    }
    const salt = result.rows[0].salt;
    const hash = crypto.createHash('sha256').update(req.body.password + salt).digest('ascii');
    if (hash === result.rows[0].hash) {
      req.session.username = req.body.username;
      res.write('<p>Successfully logged in</p>');
      return;
    }
    else {
      res.write('<p>Incorrect password</p>');
      return;
    }
  });


  // res.write(`<h1>Username: ${req.body.username}</h1>`);
  // res.write(`<h1>Password: ${req.body.password}</h1>`);
  // res.end();
}
function createPost(req, res) {
    //console.log(req.body);     
    console.log("Creating New Post");
    res.writeHead(200, {'Content-Type': 'text/text'});
    res.write("Got new post");
    const postID = Date.now(); //In the future, do "/uploads/" + postID.toString() + ".txt"
    res.end();                          
    fs.writeFileSync(path.dirname('') + '/uploads/' + postID.toString() +".txt", req.body.AudioFile, {encoding: 'base64'});                         
    //This is just a placeholder, we will probably use databases but for now it stores the audiofile in the uploads/ folder
    //It stores the post and the path to the base64 audio file in an object with a unique post ID
    fakedatapostslist1[postID] = {"PostID":postID, "Username":req.body.Username, "Time":req.body.Time, "Title":req.body.Title, 
    "Body":req.body.Body, "Likes":req.body.Likes, "Dislikes":req.body.Dislikes, 
    "Replies":req.body.Replies,"AudioFile":path.dirname('') + '/uploads/' + postID.toString() +".txt"};      
    console.log(fakedatapostslist1[postID]);  
} 
function frontPageHandle(req, res){
  console.log("Sending forum file");
  res.sendFile('forum.html', { root: path.dirname('') });      
}
function basicLooperHandle(req, res) {
  console.log("Looper");
  res.sendFile('looper.html', { root: path.dirname('') });                                                                                 
}
function loginHandle(req, res) {
  console.log("Login");
  res.sendFile('login.html', {root: path.dirname('')});
}
function registerHandle(req, res) {
  console.log("Register");
  res.sendFile('register.html', {root: path.dirname('')});
}
function frontPageGetPosts(req, res){
  console.log("Getting Front Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postIDs = [];
  let postsObjects = [];
  Object.entries(fakedatapostslist1).forEach(([postID, value]) => {postIDs.push(postID), postsObjects.push(fakedatapostslist1[postID])});
  let frontpageposts = {"PostIDs": postIDs,"Posts":postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

function newestPageGetPosts(req, res){
  console.log("Getting Newest Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postIDs = [];
  let postsObjects = [];
  Object.entries(fakedatapostslist2).forEach(([postID, value]) => {postIDs.push(postID), postsObjects.push(fakedatapostslist2[postID])});
  let frontpageposts = {"PostIDs": postIDs,"Posts":postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

function latestRepliesPageGetPosts(req, res){
  console.log("Getting Latest Replies Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postIDs = [];
  let postsObjects = [];
  Object.entries(fakedatapostslist1).forEach(([postID, value]) => {postIDs.push(postID), postsObjects.push(fakedatapostslist1[postID])});
  let frontpageposts = {"PostIDs": postIDs,"Posts":postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

function yourPostsPageGetPosts(req, res){
  console.log("Getting Your Posts Page List Of Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postIDs = [];
  let postsObjects = [];
  Object.entries(fakedatapostslist2).forEach(([postID, value]) => {postIDs.push(postID), postsObjects.push(fakedatapostslist2[postID])});
  let frontpageposts = {"PostIDs": postIDs,"Posts":postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

function likepost(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Liking post, post ID: " + req.body["PostID"]);
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Liked postID: " + req.body["PostID"]);
  res.end();   
}

function dislikepost(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Disliking post, post ID: " + req.body["PostID"]);
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Disliked postID: " + req.body["PostID"]);
  res.end();   
}

function receivereply(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Replying to post, post ID: " + req.body["PostID"]);
  console.log(req.body["Reply"]);
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Replied to postID: " + req.body["PostID"]);
  res.end();   
}

function getAudio(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Getting audio file from post ID: " + req.query.id);
  res.writeHead(200, {'Content-Type': 'application/json'});
  console.log("Getting file: " + fakedatapostslist1[req.query.id]["AudioFile"]);
  const contents = fs.readFileSync(fakedatapostslist1[req.query.id]["AudioFile"], {encoding: 'base64'});
  res.write(JSON.stringify({"AudioFile":contents}));
  res.end();   
}

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const port = 80;
app.use(express.static(path.dirname('')));
console.log("Sending File");
/*app.use(session({
  store: new pgSession({
    conString: getSecret('DATABASE_URL'),
    ssl: {
      rejectUnauthorized: false
    }
  }),
  secret: 'test_secret_not_for_prod', // put in env variable
  saveUninitialized: true,
  resave: false
}))*/
app.use(cookieParser());
const [user, pass] = ['user', 'pass']; // replace with db/env variable

//Will show the correct posts in the future, for now just returns all the posts
app.get('/frontpage/posts/getPosts', frontPageGetPosts);
app.get('/newest/posts/getPosts', newestPageGetPosts);
app.get('/latestReplies/posts/getPosts', latestRepliesPageGetPosts);
app.get('/yourPosts/posts/getPosts', yourPostsPageGetPosts);
app.get('/', basicGetHandle);


app.get('/frontpage', frontPageHandle);
app.get('/looper', basicLooperHandle);
app.get('/posts/getAudioFile', getAudio);
app.get('/login', loginHandle);
app.get('/register', registerHandle);
app.get('/loggedintest', (req, res) => {
  const sesh = req.session;
  console.log(sesh);
  res.writeHead(200, {'Content-Type': 'text/text'});
  if (sesh.userId) {
    res.write('Logged in as ' + sesh.userId);
  }
  else {
    res.write('Not logged in');
  }
  res.end();
})
app.post('/userlogin', userLogin);
app.post('/userregister', userRegister);
app.post('/posts/createPost', createPost);
app.post('/posts/likepost', likepost);
app.post('/posts/dislikepost', dislikepost);
app.post('/posts/reply', receivereply);


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


