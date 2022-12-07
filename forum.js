function setActive(elementId){
    if (document.getElementById("FrontPage").classList.contains("active")){
        document.getElementById("FrontPage").classList.remove("active");
    }
    if (document.getElementById("NewPosts").classList.contains("active")){
        document.getElementById("NewPosts").classList.remove("active");
    }
    if (document.getElementById("LatestReplies").classList.contains("active")){
        document.getElementById("LatestReplies").classList.remove("active");
    }
    if (document.getElementById("YourPosts").classList.contains("active")){
        document.getElementById("YourPosts").classList.remove("active");
    }
    document.getElementById(elementId).classList.add("active");
}

async function search(){
    const search = document.getElementById("searchbox")

    console.log("Searching for: " + document.getElementById("searchbox").value);
    if (document.getElementById("FrontPage").classList.contains("active")){
        document.getElementById("FrontPage").classList.remove("active");
    }
    if (document.getElementById("NewPosts").classList.contains("active")){
        document.getElementById("NewPosts").classList.remove("active");
    }
    if (document.getElementById("LatestReplies").classList.contains("active")){
        document.getElementById("LatestReplies").classList.remove("active");
    }
    if (document.getElementById("YourPosts").classList.contains("active")){
        document.getElementById("YourPosts").classList.remove("active");
    }
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    let posts = [];
    const response = await fetch("/posts/searchPosts?Search=" + document.getElementById("searchbox").value)
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    document.getElementById("YourPostsButton").innerHTML = "";
    //CRUD Read operation

}


function constructPost(postObject){
    const postHere = document.getElementById('postHere');
    const newPost = document.createElement('div');
    newPost.classList.add("row", "divrow", "forumpage", "rad");
        //Post title, author, and timestamp
        const div1 = document.createElement('div');
        div1.classList.add("col-sm-3", "post", "forumpage");
            const div2 = document.createElement('div');
            div2.innerHTML = postObject["Title"];
            const div3 = document.createElement('div');
            div3.classList.add("smalltext");
            //The postID was made with Date.now() so we can use it here to get time since it was posted
            const minutesSincePost = Math.floor(Math.abs(Date.now() - postObject["PostID"])/(60*1000));
            div3.innerHTML = "Made by " + postObject["Username"] + " " + minutesSincePost.toString() + " minutes ago";
            div1.appendChild(div2);
            div1.appendChild(div3);
        newPost.appendChild(div1);
        const div4 = document.createElement('div');
        div4.classList.add("col-sm-4");
        newPost.appendChild(div4);
        //Like button and likes
        const div5 = document.createElement('div');
        div5.classList.add("col-sm", "forumpage");
            const likebutton = document.createElement('button');
            likebutton.classList.add("btn", "btn-primary", "likebutton")
            likebutton.innerHTML = "Like";
            div5.appendChild(likebutton);
            const likediv = document.createElement('div');
            likediv.innerHTML = postObject["Likes"] + " likes";
            div5.append(likediv);
        newPost.appendChild(div5);
        //Dislike button and dislikes
        const div6 = document.createElement('div');
        div6.classList.add("col-sm", "forumpage");
            const dislikebutton = document.createElement('button');
            dislikebutton.classList.add("btn", "btn-danger", "likebutton")
            dislikebutton.innerHTML = "Dislike";
            div6.appendChild(dislikebutton);
            const dislikediv = document.createElement('div');
            dislikediv.innerHTML = postObject["Dislikes"] + " dislikes";
            div6.append(dislikediv);
        newPost.appendChild(div6);
         //Replies button and replies
         const div7 = document.createElement('div');
         div7.classList.add("col-sm", "forumpage");
             const replies = document.createElement('button');
             replies.classList.add("btn", "btn-secondary", "likebutton")
             replies.innerHTML = "Reply";
             div7.appendChild(replies);
             const repliesdiv = document.createElement('div');
             repliesdiv.innerHTML = postObject["Replies"].length + " replies";
             div7.append(repliesdiv);
        newPost.appendChild(div7);
        //timestamp
        const div8 = document.createElement('div');
        div8.classList.add("col-sm", "forumpage", "post");
        div8.innerHTML = "Posted on " + postObject["Time"];
        newPost.appendChild(div8);
    likebutton.addEventListener('click', () => {LikeByID(postObject['PostID'])});
    dislikebutton.addEventListener('click', () => {DislikeByID(postObject['PostID'])});
    replies.addEventListener('click', () => {ReplyHelper(postObject['PostID'])});
    div1.addEventListener('click', () => {ViewPostHelper(postObject['PostID'], postObject['Username'], postObject['Title'], postObject['Body'], postObject['Replies'])});
    
    postHere.appendChild(newPost);
    postHere.appendChild(document.createElement('br'));
    //console.log(postObject);
}
async function LikeByID(postID){
    console.log("Liking: " + postID.toString());
    const response = await fetch('/posts/likepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
            console.log(res)
            if (res.ok){
                console.log("Liked post");
            }
            else{
                window.alert("Error liking");
            }
        });
        window.location.reload();
    //CRUD Update operation
}

async function DislikeByID(postID){
    console.log("Disliking: " + postID.toString());
    const response = await fetch('/posts/dislikepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
            console.log(res)
            if (res.ok){
                console.log("Disliked post");
            }
            else{
                window.alert("Error liking");
            }
        });
        window.location.reload();
    //CRUD Update operation
}

async function ReplyHelper(postID){
    
    $("#ReplyModal").modal("show");
    document.getElementById('replytopost').addEventListener('click', ReplyByID);
    async function ReplyByID(){
        console.log("Replying: " + postID.toString());
        const thisreply = document.getElementById("replyDialog");
        if (thisreply.value === ""){
            window.alert("Missing reply");
        }
        else{
            //turing all apostrophes into \' so database stuff doesnt get messed up
            let filteredreply = ""
            for (let i = 0; i < thisreply.value.length; i++){
                if (thisreply.value[i] === "'"){
                    filteredreply += "''";
                }
                else{
                    filteredreply += thisreply.value[i];
                }
            }
            const response = await fetch('/posts/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"PostID":postID, "Reply":filteredreply, "time":Date.now()})
                }).then((res) => {
                    console.log(res)
                    if (res.ok){
                        console.log("Replied to post");
                        $("#ReplyModal").modal("hide");
                        document.getElementById('replytopost').removeEventListener('click', ReplyByID);
                        window.location.reload();
                    }
                    else{
                        window.alert("Error replying");
                        document.getElementById('replytopost').removeEventListener('click', ReplyByID);
                    }
                });
        }
    }
    //CRUD Update operation
}

async function ViewPostHelper(postID, Username, Title, Body, Replies){
    // postTitle
    // ViewpostDialog
    // Replies
    $("#LookAtPost").modal("show");
    console.log(Title);
    document.getElementById('UserTitle').innerHTML = Username;
    document.getElementById('thispostTitle').innerHTML = Title;
    if (Body === ""){
        document.getElementById('ViewPostDialog').innerHTML = "";
    }
    else{
        document.getElementById('ViewPostDialog').innerHTML = Body;
    }
    document.getElementById('postID').value = postID;
    //Simulated 2 replies
    document.getElementById('Replies').innerHTML = "";
    if (Replies.length === 0){
        document.getElementById('Replies').innerHTML = "No one has replied yet";
    }
    else {
        //Adds each reply to HTML modal in replies box
        Object.values(Replies).forEach((value) => {
            Object.keys(value).forEach((username) => {
                if (username !== '.time.'){
                    let fullreply = document.createElement("div");
                    fullreply.classList.add("singleReply");
                    let thispost = document.createElement("div");
                    thispost.classList.add("col-sm-8", "replyHelper");
                    thispost.innerHTML = username.concat(': ' + value[username]); 
                    let thistime = document.createElement("div");
                    thistime.classList.add("col-sm-8", "replysmalltext");
                    thistime.innerHTML =  (Math.floor(Math.abs(Date.now() - value['.time.'])/(60*1000))).toString().concat(" Minutes ago");
                    fullreply.append(thispost);
                    fullreply.append(thistime);
                    document.getElementById('Replies').append(fullreply);
                }
            })
        });
        const lastReplyBorder = document.createElement("div");
        lastReplyBorder.classList.add("singleReply");
        document.getElementById('Replies').append(lastReplyBorder);
    }

    //Resets the playAudio button and adds a new event listner
    let PlayAudio = document.getElementById('PlayAudio');
    PlayAudio.replaceWith(PlayAudio.cloneNode(true))
    PlayAudio = document.getElementById('PlayAudio');
    PlayAudio.addEventListener('click', grabAudio);
    
    async function grabAudio(){
        let audio = {}
        await fetch('/posts/getAudioFile?id=' + postID)
            .then((res) => res.json())
                .then((data) => audio = data);
        //console.log(audio['AudioFile']);
        var thisAudioFile = new Audio("data:audio/mp3;base64," + audio['AudioFile'])
        thisAudioFile.play();
    }
}


async function loadFrontPage(){
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    console.log("Loading Front Page");
    let posts = [];
    const response = await fetch("/frontpage/posts/getPosts")
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    document.getElementById("YourPostsButton").innerHTML = "";
    //CRUD Read operation
}

async function loadNew(){
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    console.log("Loading New Posts");
    let posts = [];
    const response = await fetch("/newest/posts/getPosts")
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    document.getElementById("YourPostsButton").innerHTML = "";
    //CRUD Read operation
}

async function loadReplies(){
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    console.log("Loading Latest Replies");
    let posts = [];
    const response = await fetch("/latestreplies/posts/getPosts")
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    document.getElementById("YourPostsButton").innerHTML = "";
    //CRUD Read operation
}
async function loadYourPosts(){
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    console.log("Loading Your Posts");
    let posts = [];
    const username = "NewUsername"
    const response = await fetch("/yourPosts/posts/getPosts?username=" + username)
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    //CRUD Read operation
    // document.getElementById("YourPostsButton").innerHTML = "";
    // const editbutton = document.createElement('button');
    // editbutton.classList.add("btn", "btn-warning", "likebutton")
    // editbutton.innerHTML = "Edit";
    // document.getElementById("YourPostsButton").appendChild(editbutton);
    // editbutton.addEventListener('click', () => editbyID(document.getElementById("postID").value))

    const deletebutton = document.createElement('button');
    deletebutton.classList.add("btn", "btn-danger", "likebutton")
    deletebutton.innerHTML = "Delete";
    document.getElementById("YourPostsButton").appendChild(deletebutton);
    deletebutton.addEventListener('click', () => deletebyID(document.getElementById("postID").value));
    //CRUD Update operation
}

async function deletebyID(postID){
    console.log("deleting post " + postID);
    const response = await fetch('/posts/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
            console.log(res)
            if (res.ok){
                console.log("Deleted post");
            }
            else{
                window.alert("Error Deleting");
            }
        });
    //CRUD Delete Operation
    window.location.reload();
}

function editbyID(postID){
    console.log("editing post " + postID);
    //CRUD Delete Operation
}

function createPost(){
    console.log("Creating Post");
    const postTitle = document.getElementById("postTitle"); //Value in the post title box
    const postBody = document.getElementById("postDialog"); //Value in the post body box
    const uploadedFile = document.getElementById("FileUpload"); //Value in the post file input
    if(postTitle.value === "" || uploadedFile.files.length == 0){ //If there's no title or file then it doesn't actually create a post (body text is optional)
        if (postTitle.value === "" && uploadedFile.files.length == 0){
            window.alert("Missing Title and File Input")
        }
        else if (postTitle.value === ""){
            window.alert("Missing Title");
        } else { window.alert("Missing File Input");}
    }else{
        //Semd a forum post of format:  
        //{Username:"NewUsername", Time:date, Title:title, Body:body, 
        //Likes:0, Dislikes:0, Replies:[],AudioFile:File}
        const currentdate = new Date();
        const date = 
        (currentdate.getMonth()+1) + "/"
        + currentdate.getDate()  + "/" 
        + currentdate.getFullYear() + " @ "  
        + currentdate.getHours() + ":"  
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds();
        
        function getBase64(file) {
            return new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.onload = function() { resolve(reader.result); };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        const promise = getBase64(uploadedFile.files[0]);
        promise.then(function(result) {
            console.log("Uploading to server");
            
            //Change username to persons username
            const newPost = 
            {"Username":"NewUsername", "Time":date, "Title":postTitle.value, "Body":postBody.value, 
            "Likes":0, "Dislikes":0, "Replies":[],"AudioFile":result};
            
            const response = fetch('/posts/createPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
            }).then((res) => {
                console.log(res)
                if (res.ok){
                    $("#CreatePostModal").modal("hide");
                    $("#postnotif").show();
                    setTimeout(function() { $("#postnotif").hide();},5000);
                    postTitle.value = "";
                    postBody.value = "";
                    uploadedFile.value = "";
                    window.location.reload();
                }
                else{
                    window.alert("Error creating post");
                }
            });
        });
    }
    //CRUD create operation
}
function goToLooper(){
    console.log("Switching to looper");
    window.location = "looper"
}

function Login(){
    console.log("Logging in");
    window.location='login'
}
function Logout() {
    fetch('/logout', {method: 'DELETE'}).then(location.reload);
}
function Register(){
    console.log("Register");
    window.location='register';
    //CRUD Read operation
}
function goToAccount(){
    console.log("Loading Your Account");
    window.location='account'
}
function init() {
    console.log("Welcome!");
    loadFrontPage();
    document.getElementById("FrontPage").classList.add('active');  
    document.getElementById("FrontPage").addEventListener('click', function(){ setActive('FrontPage')});
    document.getElementById("NewPosts").addEventListener('click', function(){setActive('NewPosts')});
    document.getElementById("LatestReplies").addEventListener('click', function(){setActive('LatestReplies')});
    if (document.getElementById("YourPosts")) {
        document.getElementById("YourPosts").addEventListener('click', function(){setActive('YourPosts')});
    }
    document.getElementById("searchbutton").addEventListener('click', search);
    document.getElementById("Looper").addEventListener('click', goToLooper);
    document.getElementById("FrontPage").addEventListener('click', loadFrontPage);
    document.getElementById("NewPosts").addEventListener('click', loadNew);
    document.getElementById("LatestReplies").addEventListener('click', loadReplies);
    document.getElementById("YourPosts").addEventListener('click', loadYourPosts);
    document.getElementById("CreatePost").addEventListener('click', createPost);
    if (document.getElementById("Login")) {
        document.getElementById("Login").addEventListener('click', Login);
        document.getElementById("Register").addEventListener('click', Register);
    }
    else {
        document.getElementById("Logout").addEventListener('click', Logout);
        document.getElementById("MyAccount").addEventListener('click', goToAccount);
    }
}


window.onload = init;