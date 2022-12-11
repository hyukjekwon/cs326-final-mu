import { parse } from 'url';
import path from 'path';
import http, { request } from 'http'; 
import express from 'express'
import fs, { read } from 'fs'
import {getAudioFileFromFileDB, addFileToDB, addPostToDB, getFrontPageFromDB, getNewestPageFromDB, searchForPosts, getAudioFileFromDB, getLatestRepliesPageFromDB, addReplyToDB, getUsernamesPostsFromDB, LikeByIdDB, DislikeByIdDB, DeletePostByIdDB} from './database.js'
import cookieParser from 'cookie-parser';
import pg from 'pg';
import crypto from 'crypto';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import ejs from 'ejs';
const pgSession = connectPg(session);

function getSecret(key) {
  return process.env[key] || require('secrets.json')[key];
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
      res.writeHead(500);
      res.end('error1');
      return;
    }
    if (result.rows.length) {
      res.writeHead(500);
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
        res.writeHead(500);
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
      res.writeHead(500);
      res.end('error1');
      return;
    }
    if (!result.rows.length) {
      res.writeHead(500);
      res.end("Username not found");
      return;
    }
    // check password
    const salt = result.rows[0].salt;
    const hash = result.rows[0].hash;
    const hash2 = crypto.createHash('sha256').update(salt + password).digest('ascii');
    if (hash == hash2) {
      req.session.username = username;
      res.writeHead(200);
      res.end("logged in as " + username + ', do session stuff');
      return;
    }
    res.writeHead(500);
    res.end("incorrect password");
  });
}
function createPost(req, res) {
    console.log("Creating New Post");
    const postID = Date.now();               
    //It stores the post and the path to the base64 audio file in an object with a unique post ID
    const thispost = {"PostID":postID, "Username":req.session.username || 'NewUser', "Time":req.body.Time, 
    "Title":req.body.Title, "Body":req.body.Body, "Likes":req.body.Likes, "Dislikes":req.body.Dislikes, 
    "Replies":[],"AudioFile": + postID.toString()};      
    addPostToDB(thispost);
    console.log("Creating post to File DB " + postID.toString());
    addFileToDB({"PostID":postID.toString(), "postfile":req.body.AudioFile});
    res.writeHead(200, {'Content-Type': 'text/text'});
    res.write("Got new post");
    res.end();   
} 

function frontPageHandle(req, res){
  console.log("Sending forum file");
  // render with true to indicate logged in
  res.render('forum.ejs', {username: req.session.username});
  //res.render('forum.ejs');
  //res.sendFile('forum.html', { root: path.dirname('') });      
}
function basicLooperHandle(req, res) {
  console.log("Looper");
  res.sendFile('looper.html', { root: path.dirname('') });                                                                                 
}
async function frontPageGetPosts(req, res){
  console.log("Getting Front Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  const getPosts = await getFrontPageFromDB();
  getPosts.forEach(function (value) {postsObjects.push(value);});
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

function renderAccountPage(req, res){
  if(req.session.username){
    res.render('account', {username: req.session.username});
  }
  else{
    res.redirect('/login');
  }
}

async function newestPageGetPosts(req, res){
  console.log("Getting Newest Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  const getPosts = await getNewestPageFromDB();
  getPosts.forEach(function (value) {postsObjects.push(value);});
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

async function latestRepliesPageGetPosts(req, res){
  console.log("Getting Latest Replies Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  const getPosts = await getLatestRepliesPageFromDB();
  getPosts.forEach(function (value) {postsObjects.push(value);});
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

async function searchPosts(req, res){
    console.log("Searching for Posts");
    res.writeHead(200, {'Content-Type': 'text/text'});
    let postsObjects = [];
    const getPosts = await searchForPosts(req.query.Search);
    getPosts.forEach(function (value) {postsObjects.push(value);});
    let frontpageposts = {postsObjects};
    res.write(JSON.stringify(frontpageposts));
    res.end(); 
  
}

async function yourPostsPageGetPosts(req, res){
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  let getPosts = [];
  if (req.session.username) {
    getPosts = await getUsernamesPostsFromDB(req.session.username);
    getPosts.forEach(function (value) {postsObjects.push(value);});
  }
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

async function likepost(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Liking post, post ID: " + req.body["PostID"]);
  await LikeByIdDB(req.body["PostID"]);
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Liked postID: " + req.body["PostID"]);
  res.end();   
}

async function dislikepost(req, res){
  //This will receive the post ID and add 1 dislike to the total
  console.log("Disliking post, post ID: " + req.body["PostID"]);
  await DislikeByIdDB(req.body["PostID"]);
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Disliked postID: " + req.body["PostID"]);
  res.end();   
}

async function receivereply(req, res){
  let username = req.session.username;
  if (!req.session.username) {
    username = "Anonymous";
  }
  //This will receive the post ID and add a reply to the post
  console.log("Replying to post, post ID: " + req.body["PostID"]);
  const newrep = {".time.":req.body["time"]};
  newrep[username] = req.body["Reply"];
  await addReplyToDB(req.body["PostID"], newrep)
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Replied to postID: " + req.body["PostID"]);
  res.end();   
}

async function deletePost(req, res){
  //This will receive the post ID and delete the post
  console.log("Deleting post, post ID: " + req.body["PostID"]);
  await DeletePostByIdDB(req.body["PostID"])
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Deleted post postID: " + req.body["PostID"]);
  res.end();   
}

async function getAudio(req, res){
  //This will receive the post ID and return the audio
  console.log("Getting audio file from post ID: " + req.query.id);
  res.writeHead(200, {'Content-Type': 'application/json'});
  const aud = await getAudioFileFromDB(req.query.id);
  console.log("Getting file: " + aud[0]["audiofile"] + " from File DB");
  const contents = await getAudioFileFromFileDB( aud[0]["audiofile"]);
  res.write(JSON.stringify({"AudioFile":contents}));
  res.end();   
}

const app = express();
app.set('view engine', 'ejs');
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const port = 80;
app.use(express.static(path.dirname('')));
let pool = new pg.Pool({connectionString: getSecret('DATABASE_URL'), ssl: {rejectUnauthorized: false}})
app.use(session({
  store: new pgSession({createTableIfMissing: true, pool: pool}),
  secret: 'testsecret',
  resave: false,
  saveUninitialized: false
}))
console.log("Sending File");

//Will show the correct posts in the future, for now just returns all the posts
app.get('/frontpage/posts/getPosts', (req, res) => {(frontPageGetPosts(req, res))});
app.get('/posts/searchPosts', (req, res) => {(searchPosts(req, res))});
app.get('/newest/posts/getPosts', (req, res) => {(newestPageGetPosts(req, res))});
app.get('/latestReplies/posts/getPosts', (req, res) => {(latestRepliesPageGetPosts(req, res))});
app.get('/yourPosts/posts/getPosts', (req, res) => {(yourPostsPageGetPosts(req, res))});
app.get('/', (req, res) => {(basicGetHandle(req, res))});
app.get('/register', (req, res) => res.sendFile('register.html', {root: path.dirname('')}));
app.get('/login', (req, res) => res.sendFile('login.html', {root: path.dirname('')}));
app.get('/account', renderAccountPage);

/*app.get('/loggedintest', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/text'});
  console.log('req.session', req.session);
  console.log('req.session.username', req.session.username);
  if(req.session.username) {
    res.end("Logged in as " + req.session.username);
  }
  else{
    res.end("Not logged in");
  }
});*/

app.get('/frontpage', (req, res) => {(frontPageHandle(req, res))});
app.get('/looper', (req, res) => {(basicLooperHandle(req, res))});
app.get('/posts/getAudioFile', (req, res) => {(getAudio(req, res))});
app.post('/posts/createPost', (req, res) => {(createPost(req, res))});
app.post('/posts/likepost', (req, res) => {(likepost(req, res))});
app.post('/posts/dislikepost', (req, res) => {(dislikepost(req, res))});
app.post('/posts/reply', (req, res) => {(receivereply(req, res))});
app.post('/posts/delete', (req, res) => {(deletePost(req, res))});
app.post('/userregister', userRegister);
app.post('/userlogin', userLogin);

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.redirect('/');
  res.end();
});
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


