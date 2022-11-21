import pgPromise from 'pg-promise'
import dotenv from "dotenv"
dotenv.config()
//dotenv.config({ path: './test.env'})
const pgp = pgPromise({});


pgp.pg.defaults.ssl = {
  rejectUnauthorized: false
}
const db = pgp(process.env['DATABASE_URL']);

async function addPostToDB(post){
  db.connect()
    .then(async (obj) => {
      db.none('INSERT INTO posts(PostID, Username, Time, Title, Body, Likes, Dislikes, Replies, AudioFile, LastReplyTime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [post["PostID"], post["Username"], post["Time"], post["Title"], post["Body"], post["Likes"], post["Dislikes"], '[]', post["AudioFile"], 0]);
      console.log("Post Created")
      obj.done();
    })
    .catch((error) => {
      console.log('ERROR', error.message);
    });
}

async function getRepliesFromDB(postID){
  const c = await db.connect()
  let newQuery = 'SELECT replies FROM posts WHERE postid = '.concat(postID);
  const r = await db.any(newQuery);
  c.done();
  return r;
}

async function addReplyToDB(postID, reply){
  db.connect()
    .then(async (obj) => {
      db.none('UPDATE posts SET replies = replies::jsonb || \'' + JSON.stringify(reply) + '\'::jsonb WHERE postid = '.concat(postID));
      db.none('UPDATE posts SET LastReplyTime = ' + Date.now() + 'WHERE postid = ' + postID);
      console.log("Reply Added")
      obj.done();
    })
    .catch((error) => {
      console.log('ERROR', error.message);
    });
}

//UPDATE posts SET replies = replies::jsonb || '{"a":"b"}'::jsonb WHERE postid = 1668023552011;
async function getAudioFileFromDB(postID){
  const c = await db.connect()
  let newQuery = 'SELECT audiofile FROM posts WHERE postid = '.concat(postID);
  const r = await db.any(newQuery);
  c.done();
  return r;
}

async function getFrontPageFromDB(){
  const c = await db.connect()
  const r = await db.any('SELECT * FROM posts ORDER BY likes DESC LIMIT 10');
  c.done();
  return r;
}

async function getNewestPageFromDB(){
  const c = await db.connect()
  const r = await db.any('SELECT * FROM posts ORDER BY postid DESC LIMIT 10');
  c.done();
  return r;
}

async function getUsernamesPostsFromDB(username){
  const c = await db.connect()
  console.log('SELECT * FROM posts WHERE username = ' + username);
  const r = await db.any('SELECT * FROM posts WHERE username = \'' + username + '\'');
  c.done();
  return r;
}

async function getLatestRepliesPageFromDB(){
  const c = await db.connect()
  const r = await db.any('SELECT * FROM posts ORDER BY lastreplytime DESC LIMIT 10');
  c.done();
  return r;
}

async function LikeByIdDB(postID){
  db.connect()
    .then(async (obj) => {
      db.none('UPDATE posts SET likes = likes + 1 WHERE postid = ' + postID);
      console.log("Liked post")
      obj.done();
    })
    .catch((error) => {
      console.log('ERROR', error.message);
    });
}

async function DislikeByIdDB(postID){
  db.connect()
    .then(async (obj) => {
      db.none('UPDATE posts SET dislikes = dislikes + 1 WHERE postid = ' + postID);
      console.log("Liked post")
      obj.done();
    })
    .catch((error) => {
      console.log('ERROR', error.message);
    });
}

export {addPostToDB, getFrontPageFromDB, getNewestPageFromDB, getAudioFileFromDB, addReplyToDB, getLatestRepliesPageFromDB, getUsernamesPostsFromDB, LikeByIdDB, DislikeByIdDB};

// const res = await getFrontPageFromDB()
// console.log(res);

// import Client from 'pg'
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// client.connect();

// client.query('SELECT * FROM posts;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });