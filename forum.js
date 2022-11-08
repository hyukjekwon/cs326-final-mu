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