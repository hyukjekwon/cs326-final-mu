import { parse } from 'url';
import path from 'path';
import http from 'http'; 
import express from 'express'
import fs from 'fs'


//Fake data for posts, this is the format they will use
let posts = {
  '1668023535539': {
    PostID: 1668023535539,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:15',
    Title: 'Hello There!',
    Body: "Check out my new beat, it's pretty cool!",
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023552011': {
    PostID: 1668023552011,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:31',
    Title: 'Sup guys!',
    Body: 'Created a new beat check it out!',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023578899': {
    PostID: 1668023578899,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:52:58',
    Title: 'Made a new beat',
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023596460': {
    PostID: 1668023596460,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:16',
    Title: "Think you'll like this one",
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023611412': {
    PostID: 1668023611412,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:31',
    Title: 'Check this out',
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023625281': {
    PostID: 1668023625281,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:45',
    Title: "You won't regret clicking",
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023635377': {
    PostID: 1668023635377,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:53:55',
    Title: 'WOOOOOOOOO',
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023784829': {
    PostID: 1668023784829,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:56:24',
    Title: 'This is really good!',
    Body: '',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023806321': {
    PostID: 1668023806321,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:56:46',
    Title: 'Click here',
    Body: 'made a new beat check it out lemme know what you think',
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  },
  '1668023829415': {
    PostID: 1668023829415,
    Username: 'NewUsername',
    Time: '11/9/2022 @ 14:57:9',
    Title: 'sup sup',
    Body: "hey guys, spend awhile on this one, think you'll like it",
    Likes: 0,
    Dislikes: 0,
    Replies: [],
    AudioFile: './uploads/cantina.txt'
  }
}

function basicGetHandle(req, res) {
    // res.writeHead(200, {'Content-Type': 'text/html'}); // we're sending HTML                                                       
    // res.write('Hello World!<BR>'); //write a response to the client                                                                
    // const requestedURL = req.url;
    // console.log('helooooooooooooooooooooooooooooooooooooooooooooooooooooooo ' + requestedURL);
    // res.write(`URL is <B>${requestedURL+"foo"}</B><BR>`); // template string (backquote)                                                 
    // const parsedURL = parse(requestedURL, true);
    // const query = parsedURL.query;
    // const pathname = parsedURL.pathname;
    // res.write(`path is <B>${JSON.stringify(pathname)}</B><BR>`);
    // res.write(`query components are <B>${JSON.stringify(query)}</B><BR>`);
    // if (Number.parseInt(query.age) >= 21) {
    //   res.write('DRINK UP!<BR>');
    // } else {
    //   res.write('STAY SOBER KIDS!<BR>');
    // }
    // res.end(); //end the response    
    console.log("Sending File");
    res.sendFile('forum.html', { root: path.dirname('') });                                                                              
}

function createPost(req, res) {
    //console.log(req.body);     
    console.log("Retrieving Post");
    res.writeHead(200, {'Content-Type': 'text/text'});
    res.write("Got new post");
    const postID = Date.now(); //In the future, do "/uploads/" + postID.toString() + ".txt"
    res.end();                          
    fs.writeFile(path.dirname('') + "/uploads/cantina.txt", req.body.AudioFile, (err) => {
      if (err){
        console.log(err);
      }
      else{
        //This is just a placeholder, we will probably use databases but for now it stores the audiofile in the uploads/ folder
        //It stores the post and the path to the base64 audio file in an object with a unique post ID
        posts[postID] = {"PostID":postID, "Username":req.body.Username, "Time":req.body.Time, "Title":req.body.Title, 
        "Body":req.body.Body, "Likes":req.body.Likes, "Dislikes":req.body.Dislikes, 
        "Replies":req.body.Replies,"AudioFile":path.dirname('') + "/uploads/cantina.txt"};      
        console.log(posts)
      }
    });                         
}


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const port = 80;
app.use(express.static(path.dirname('')));
console.log("Sending File");

app.get('/', (req, res) => {(basicGetHandle(req, res))});
app.get('/frontpage', (req, res) => {(basicGetHandle(req, res))});
app.post('/createPost', (req, res) => {(createPost(req, res))});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


