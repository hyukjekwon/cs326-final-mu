import { parse } from 'url';
import path from 'path';
import http from 'http'; 
import express from 'express'

const posts = [];

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
    //console.log(req.body.AudioFile)
    res.writeHead(200, {'Content-Type': 'text/text'});
    res.write("Got new post");
    res.end();                                                                     
}


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const port = 80;
app.use(express.static(path.dirname('')));
console.log("Sending File");

app.get('/', (req, res) => {(basicGetHandle(req, res))});
app.post('/createPost', (req, res) => {(createPost(req, res))});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
})


