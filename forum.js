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
    if (document.getElementById("YourPosts") !== null){
        if (document.getElementById("YourPosts").classList.contains("active")){
            document.getElementById("YourPosts").classList.remove("active");
        }
    }
    document.getElementById(elementId).classList.add("active");
}

async function search(){
    const search = document.getElementById("searchbox")

    console.log("Searching for: " + search.value);
    if (document.getElementById("FrontPage").classList.contains("active")){
        document.getElementById("FrontPage").classList.remove("active");
    }
    if (document.getElementById("NewPosts").classList.contains("active")){
        document.getElementById("NewPosts").classList.remove("active");
    }
    if (document.getElementById("LatestReplies").classList.contains("active")){
        document.getElementById("LatestReplies").classList.remove("active");
    }
    if (document.getElementById("YourPosts") !== null){
        if (document.getElementById("YourPosts").classList.contains("active")){
            document.getElementById("YourPosts").classList.remove("active");
        }
    }
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    let posts = [];
    await fetch("/posts/searchPosts?Search=" + document.getElementById("searchbox").value)
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
        div8.classList.add("col-sm", "forumpage", "timestamp");
        div8.innerHTML = "Posted on " + postObject["Time"];
        newPost.appendChild(div8);
    likebutton.addEventListener('click', () => {LikeByID(postObject['PostID'])});
    dislikebutton.addEventListener('click', () => {DislikeByID(postObject['PostID'])});
    replies.addEventListener('click', () => {ReplyHelper(postObject['PostID'])});
    div1.addEventListener('click', () => {ViewPostHelper(postObject['PostID'], postObject['Username'], postObject['Title'], postObject['Body'], postObject['Replies'])});
    
    postHere.appendChild(newPost);
    postHere.appendChild(document.createElement('br'));
}
async function LikeByID(postID){
    console.log("Liking: " + postID.toString());
    await fetch('/posts/likepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
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
    await fetch('/posts/dislikepost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
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
            //turning all apostrophes into \' so to avoid SQL injection
            let filteredreply = ""
            for (let i = 0; i < thisreply.value.length; i++){
                if (thisreply.value[i] === "'"){
                    filteredreply += "''";
                }
                else{
                    filteredreply += thisreply.value[i];
                }
            }
            await fetch('/posts/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"PostID":postID, "Reply":filteredreply, "time":Date.now()})
                }).then((res) => {
                    //console.log(res)
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
                    fullreply.classList.add("singleReply", "list-group-item", "postDiag");
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
    PlayAudio.innerHTML = "Play";
    PlayAudio.replaceWith(PlayAudio.cloneNode(true))
    PlayAudio = document.getElementById('PlayAudio');
    let BackAudio = document.getElementById('BackAudio');
    let ForwardAudio = document.getElementById('ForwardAudio');
    let volumeControl = document.getElementById("volume-control");
    let timeControl = document.getElementById("time-control");
    let AudioTimeStamp = document.getElementById("audiotimestamp");
    let audio = {}
    console.log('Getting file');
    await fetch('/posts/getAudioFile?id=' + postID)
        .then((res) => res.json())
            .then((data) => audio = data);

    var thisAudioFile = new Audio(audio['AudioFile']['postfile']);
    PlayAudio.addEventListener('click', PlayPause);
    BackAudio.addEventListener('click', Back);
    ForwardAudio.addEventListener('click', Forward);
    volumeControl.addEventListener("change", changeVolume);
    timeControl.addEventListener("change", changeTime);
    timeControl.addEventListener("mousedown", Pause);
    timeControl.addEventListener("mouseup", Play);
    thisAudioFile.addEventListener("timeupdate", TimeUpdate);

    function PlayPause(){
        if (PlayAudio.innerHTML === "Play"){
            PlayAudio.innerHTML = "Pause"
            thisAudioFile.play();
        }
        else{
            PlayAudio.innerHTML = "Play"
            thisAudioFile.pause();
        }
    }
    function Pause(){
        PlayAudio.innerHTML = "Play"
        thisAudioFile.pause();
    }
    function Play(){
        PlayAudio.innerHTML = "Pause"
        thisAudioFile.play();
    }
    function Back(){
        thisAudioFile.currentTime = 0;
        PlayAudio.innerHTML = "Pause"
        thisAudioFile.play();
    }
    function Forward(){
        if(thisAudioFile.currentTime + 15 < thisAudioFile.duration){
            thisAudioFile.currentTime += 15;
            PlayAudio.innerHTML = "Pause"
            thisAudioFile.play();
        }
        else{
            thisAudioFile.currentTime = thisAudioFile.duration
            PlayAudio.innerHTML = "Play"
            thisAudioFile.pause();
        }
    }
    function changeVolume() {
        thisAudioFile.volume = volumeControl.value / 100;
    }
    
    thisAudioFile.onloadedmetadata = function() {
        timeControl.max = Math.floor(thisAudioFile.duration);
    };
    timeControl.value = 0;
    AudioTimeStamp.innerHTML = '0:0';
    function changeTime(){
        thisAudioFile.currentTime = timeControl.value;
    }
    function TimeUpdate(){
        timeControl.value = thisAudioFile.currentTime;
        let TimeString = Math.floor(thisAudioFile.currentTime/60).toString();
        if (TimeString.length <2){
            TimeString = '0'+TimeString;
        }
        let TimeString2 = Math.floor(thisAudioFile.currentTime % 60).toString();
        if (TimeString2.length <2){
            TimeString2 = '0'+TimeString2;
        }
        AudioTimeStamp.innerHTML = TimeString + ":" + TimeString2;
        if(thisAudioFile.currentTime === thisAudioFile.duration){
            PlayAudio.innerHTML = "Pause"
            thisAudioFile.currentTime = 0;
            thisAudioFile.play();
        }
    }
    $("#LookAtPost").on("hidden.bs.modal", function () {
        Pause();
        PlayAudio.removeEventListener('click', PlayPause);
        BackAudio.removeEventListener('click', Back);
        ForwardAudio.removeEventListener('click', Forward);
        volumeControl.removeEventListener("change", changeVolume);
        timeControl.removeEventListener("change", changeTime);
        timeControl.removeEventListener("mousedown", Pause);
        timeControl.removeEventListener("mouseup", Play);
        thisAudioFile.removeEventListener("timeupdate", TimeUpdate);
    });
}


async function loadFrontPage(){
    const postHere = document.getElementById('postHere');
    postHere.innerHTML = "";
    console.log("Loading Front Page");
    let posts = [];
    await fetch("/frontpage/posts/getPosts")
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
    await fetch("/newest/posts/getPosts")
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
    await fetch("/latestreplies/posts/getPosts")
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
    await fetch("/yourPosts/posts/getPosts?username=" + username)
        .then((response) => response.json())
            .then((data) => posts = data);
    for (let i = 0; i< posts['postsObjects'].length; i++){
        const thisPostObject = {"PostID":posts['postsObjects'][i]['postid'], "Username":posts['postsObjects'][i]['username'], "Time": posts['postsObjects'][i]['time'], "Title":posts['postsObjects'][i]['title'], "Body":posts['postsObjects'][i]['body'], "Likes": posts['postsObjects'][i]['likes'], "Dislikes": posts['postsObjects'][i]['dislikes'], "Replies":posts['postsObjects'][i]['replies'],"AudioFile":posts['postsObjects'][i]['audiofile']}
        constructPost(thisPostObject);
    } 
    //CRUD Read operation

    const deletebutton = document.createElement('button');
    deletebutton.classList.add("btn", "btn-danger", "likebutton")
    deletebutton.innerHTML = "Delete";
    document.getElementById("YourPostsButton").appendChild(deletebutton);
    deletebutton.addEventListener('click', () => deletebyID(document.getElementById("postID").value));
    //CRUD Update operation
}

async function deletebyID(postID){
    console.log("deleting post " + postID);
    await fetch('/posts/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"PostID":postID})
        }).then((res) => {
            //console.log(res)
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


function createPost(){
    console.log("Creating Post");
    const postTitle = document.getElementById("postTitle"); //Value in the post title box
    const postBody = document.getElementById("postDialog"); //Value in the post body box
    const uploadedFile = document.getElementById("FileUpload"); //Value in the post file input
    if(postTitle.value === "" || uploadedFile.files.length == 0 || !(uploadedFile.files[0].type.toString() === "audio/wav" || uploadedFile.files[0].type.toString() === "audio/mpeg"|| uploadedFile.files[0].type.toString() === "video/webm")){ //If there's no title or file, or file is mp3, then it doesn't actually create a post (body text is optional)
        if (postTitle.value === "" && uploadedFile.files.length == 0){
            window.alert("Missing Title and File Input")
        } else if (postTitle.value === ""){
            window.alert("Missing Title");
        } else if (!(uploadedFile.files[0].type.toString() === "audio/wav" || uploadedFile.files[0].type.toString() === "audio/mpeg"|| uploadedFile.files[0].type.toString() === "video/webm")){
            window.alert("Wrong File Type");
        } else { window.alert("Missing File Input");}
    }else{
        //Send a forum post of format:  
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
            
            //Backend will change username to persons username or to anon
            const newPost = 
            {"Username":"NewUsername", "Time":date, "Title":postTitle.value, "Body":postBody.value, 
            "Likes":0, "Dislikes":0, "Replies":[],"AudioFile": result};
            
            fetch('/posts/createPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
            }).then((res) => {
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
    (async () => await fetch('/logout', {method: 'POST'}))();
    location.reload();
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
    if (document.getElementById("YourPosts")) {
        document.getElementById("YourPosts").addEventListener('click', loadYourPosts);
    }
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