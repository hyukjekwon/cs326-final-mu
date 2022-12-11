async function StartLogin(){
    const response = await fetch('/userlogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"username":document.getElementById("username").value, "password":document.getElementById("password").value})
        }).then((res) => {
            //console.log(res)
            if (res.ok){
                window.location = 'frontpage'
            }
            else{
                window.alert("Incorrect username or password");
                console.log(res);
            }
        });
    }



function init() {
    console.log("Welcome!");
    document.getElementById("submit").addEventListener("click", StartLogin);  
}
window.onload = init;