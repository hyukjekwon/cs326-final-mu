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

function search(){
    const search = document.getElementById("searchbox")
    if (!(search.value === "")){
        console.log("Searching for: " + document.getElementById("searchbox").value);
    } else {
        console.log("Empty");
    }
}

function loadFrontPage(){
    console.log("Loading Front Page");
    {/* <div class="row divrow forumpage">
        <div class="col-sm-2 forumpage post">
            <div> Check out this beat I made!</div>
            <div class= "smalltext">- Made by SickBeats 10 minutes ago</div>
        </div>
        <div class="col-sm-4"></div>
        <div class="col-sm forumpage"> 
            <button type="button" class="btn btn-primary likebutton">Like</button>
            <div class="col-sm"> 137 likes </div>
        </div>
        <div class="col-sm forumpage"> 
            <button type="button" class="btn btn-danger likebutton">Dislike</button>
            <div class="col-sm"> 2 dislikes </div>
        </div>
        <div class="col-sm forumpage">
            <button type="button" class="btn btn-secondary likebutton">Reply</button>
            <div class="col-sm"> 42 replies </div>
        </div>
        <div class="col-sm forumpage post"> Posted on 10/21/2022 </div>
    </div>
    <br></br> */}
    //CRUD Read operation
}
function loadNew(){
    console.log("Loading New Posts");
    //CRUD Read operation
}
function loadReplies(){
    console.log("Loading Latest Replies");
    //CRUD Read operation
}
function loadYourPosts(){
    console.log("Loading Your Posts");
    //CRUD Read operation
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
            const newPost = 
            {"Username":"NewUsername", "Time":date, "Title":postTitle.value, "Body":postBody.value, 
            "Likes":0, "Dislikes":0, "Replies":[],"AudioFile":result};
            const response = fetch('/createPost', {
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
                }
                else{
                    window.alert("Error creating post");
                }
            });
        });
    }
    //CRUD create operation
}
function Login(){
    console.log("Logging in");
}
function Register(){
    console.log("Loading Your Posts");
    //CRUD Read operation
}
function goToAccount(){
    console.log("Loading Your Account");
    //CRUD Read operation
}
function init() {
    console.log("Welcome!");
    loadFrontPage();
    document.getElementById("FrontPage").classList.add('active');  
    document.getElementById("FrontPage").addEventListener('click', function(){ setActive('FrontPage')});
    document.getElementById("NewPosts").addEventListener('click', function(){setActive('NewPosts')});
    document.getElementById("LatestReplies").addEventListener('click', function(){setActive('LatestReplies')});
    document.getElementById("YourPosts").addEventListener('click', function(){setActive('YourPosts')});
    document.getElementById("searchbutton").addEventListener('click', search);
    document.getElementById("FrontPage").addEventListener('click', loadFrontPage);
    document.getElementById("NewPosts").addEventListener('click', loadNew);
    document.getElementById("LatestReplies").addEventListener('click', loadReplies);
    document.getElementById("YourPosts").addEventListener('click', loadYourPosts);
    document.getElementById("CreatePost").addEventListener('click', createPost);
    document.getElementById("Login").addEventListener('click', Login);
    document.getElementById("Register").addEventListener('click', Register);
    document.getElementById("MyAccount").addEventListener('click', goToAccount);
}


window.onload = init;