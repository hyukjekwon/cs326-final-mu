import { parse } from 'url';
import path from 'path';
import http from 'http'; 
import express from 'express'
import fs, { read } from 'fs'
import {addPostToDB, getFrontPageFromDB, getNewestPageFromDB, getAudioFileFromDB, getLatestRepliesPageFromDB, addReplyToDB, getUsernamesPostsFromDB, LikeByIdDB, DislikeByIdDB} from './database.js'


function basicGetHandle(req, res) {
    console.log("Redirecting");
    res.redirect('/frontpage');                                                                              
}

function createPost(req, res) {
    //console.log(req.body);     
    console.log("Creating New Post");
    const postID = Date.now();               
    fs.writeFileSync(path.dirname('') + '/uploads/' + postID.toString() +".txt", req.body.AudioFile, {encoding: 'base64'});                         
    //It stores the post and the path to the base64 audio file in an object with a unique post ID
    const thispost = {"PostID":postID, "Username":req.body.Username, "Time":req.body.Time, 
    "Title":req.body.Title, "Body":req.body.Body, "Likes":req.body.Likes, "Dislikes":req.body.Dislikes, 
    "Replies":[],"AudioFile":path.dirname('') + '/uploads/' + postID.toString() +".txt"};      
    addPostToDB(thispost);
    res.writeHead(200, {'Content-Type': 'text/text'});
    res.write("Got new post");
    res.end();   
} 

function frontPageHandle(req, res){
  console.log("Sending forum file");
  res.sendFile('forum.html', { root: path.dirname('') });      
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
  //console.log(getPosts)
  getPosts.forEach(function (value) {postsObjects.push(value);});
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

async function newestPageGetPosts(req, res){
  console.log("Getting Newest Page Posts");
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  const getPosts = await getNewestPageFromDB();
  //console.log(getPosts)
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
  //console.log(getPosts)
  getPosts.forEach(function (value) {postsObjects.push(value);});
  let frontpageposts = {postsObjects};
  res.write(JSON.stringify(frontpageposts));
  res.end();
}

async function yourPostsPageGetPosts(req, res){
  res.writeHead(200, {'Content-Type': 'text/text'});
  let postsObjects = [];
  const getPosts = await getUsernamesPostsFromDB(req.query.username);
  //console.log(getPosts)
  getPosts.forEach(function (value) {postsObjects.push(value);});
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
  //This will receive the post ID and add a reply to the post
  console.log("Replying to post, post ID: " + req.body["PostID"]);
  const newrep = {"NewUsername":req.body["Reply"], ".time.":req.body["time"]};
  await addReplyToDB(req.body["PostID"], newrep)
  res.writeHead(200, {'Content-Type': 'text/text'});
  res.write("Replied to postID: " + req.body["PostID"]);
  res.end();   
}

async function getAudio(req, res){
  //This will receive the post ID and add 1 like to the total
  console.log("Getting audio file from post ID: " + req.query.id);
  res.writeHead(200, {'Content-Type': 'application/json'});
  const aud = await getAudioFileFromDB(req.query.id);
  console.log("Getting file: " + aud[0]["audiofile"]);
  const contents = fs.readFileSync(aud[0]["audiofile"], {encoding: 'base64'});
  res.write(JSON.stringify({"AudioFile":contents}));
  res.end();   
}

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const port = 80;
app.use(express.static(path.dirname('')));
console.log("Sending File");

//Will show the correct posts in the future, for now just returns all the posts
app.get('/frontpage/posts/getPosts', (req, res) => {(frontPageGetPosts(req, res))});
app.get('/newest/posts/getPosts', (req, res) => {(newestPageGetPosts(req, res))});
app.get('/latestReplies/posts/getPosts', (req, res) => {(latestRepliesPageGetPosts(req, res))});
app.get('/yourPosts/posts/getPosts', (req, res) => {(yourPostsPageGetPosts(req, res))});
app.get('/', (req, res) => {(basicGetHandle(req, res))});


app.get('/frontpage', (req, res) => {(frontPageHandle(req, res))});
app.get('/looper', (req, res) => {(basicLooperHandle(req, res))});
app.get('/posts/getAudioFile', (req, res) => {(getAudio(req, res))});
app.post('/posts/createPost', (req, res) => {(createPost(req, res))});
app.post('/posts/likepost', (req, res) => {(likepost(req, res))});
app.post('/posts/dislikepost', (req, res) => {(dislikepost(req, res))});
app.post('/posts/reply', (req, res) => {(receivereply(req, res))});


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


