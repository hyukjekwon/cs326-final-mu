import { parse } from 'url';
import path from 'path';
import http, { request } from 'http'; 
import express from 'express'
import fs, { read } from 'fs'
import cookieParser from 'cookie-parser';
import pg from 'pg';
import crypto from 'crypto';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
//const pgSession = connectPg(session);

function getSecret(key) {
  return process.env[key] || require('secrets.json')[key];
}
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
function basicGetHandle(req, res) {
    console.log("Redirecting");
    res.redirect('/frontpage');                                                                              
}
function userRegister(req, res) {
  const username = req.body.username;
  const connectionString = getSecret('DATABASE_URL');
  // connect to db using pg
  const client = new pg.Client({connectionString, ssl: {rejectUnauthorized: false}});
  client.connect();
  // check if username is already taken
  client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      console.error(err.stack);
      res.end('error1');
      return;
    }
    if (result.rows.length) {
      res.end("Username already taken");
      return;
    }
    // add user to database
    const password = req.body.password;
    // salt and hash password
    // create salt
    const salt = crypto.randomBytes(64).toString('ascii');
    // hash password
    const hash = crypto.createHash('sha256').update(salt + password).digest('ascii');
    client.query('INSERT INTO users (username, salt, hash) VALUES ($1, $2, $3)', [username, salt, hash], (err, result) => {
      if (err) {
        console.error(err.stack);
        res.end('erro2');
        return
      }
      console.log("added " + username);
      res.end("created user " + username);
    });
  });
}
function userLogin(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const connectionString = getSecret('DATABASE_URL');
  // connect to db using pg
  const client = new pg.Client({connectionString, ssl: {rejectUnauthorized: false}});
  client.connect();
  // check if username is already taken
  client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      console.error(err.stack);
      res.end('error1');
      return;
    }
    if (!result.rows.length) {
      res.end("Username not found");
      return;
    }
    // check password
    const salt = result.rows[0].salt;
    const hash = result.rows[0].hash;
    const hash2 = crypto.createHash('sha256').update(salt + password).digest('ascii');
    if (hash == hash2) {
      req.session.username = username;
      res.end("logged in as " + username + ', do session stuff');
      return;
    }
    res.end("incorrect password");
  });
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
app.use(session({
  secret: 'testsecret',
  resave: false,
  saveUninitialized: true
}))
console.log("Sending File");

//Will show the correct posts in the future, for now just returns all the posts
app.get('/frontpage/posts/getPosts', (req, res) => {(frontPageGetPosts(req, res))});
app.get('/newest/posts/getPosts', (req, res) => {(newestPageGetPosts(req, res))});
app.get('/latestReplies/posts/getPosts', (req, res) => {(latestRepliesPageGetPosts(req, res))});
app.get('/yourPosts/posts/getPosts', (req, res) => {(yourPostsPageGetPosts(req, res))});
app.get('/', (req, res) => {(basicGetHandle(req, res))});
app.get('/register', (req, res) => res.sendFile('register.html', {root: path.dirname('')}));
app.get('/login', (req, res) => res.sendFile('login.html', {root: path.dirname('')}));
app.get('/loggedintest', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/text'});
  if(req.session.username) {
    res.end("Logged in as " + req.session.username);
  }
  else{
    res.end("Not logged in");
  }
})

app.get('/frontpage', (req, res) => {(frontPageHandle(req, res))});
app.get('/looper', (req, res) => {(basicLooperHandle(req, res))});
app.get('/posts/getAudioFile', (req, res) => {(getAudio(req, res))});
app.post('/posts/createPost', (req, res) => {(createPost(req, res))});
app.post('/posts/likepost', (req, res) => {(likepost(req, res))});
app.post('/posts/dislikepost', (req, res) => {(dislikepost(req, res))});
app.post('/posts/reply', (req, res) => {(receivereply(req, res))});
app.post('/userregister', userRegister);
app.post('/userlogin', userLogin);

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


