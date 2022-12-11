async function StartLogin(){
    const response = await fetch('/userlogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"username":document.getElementById("username"), "password":document.getElementById("password")})
        }).then((res) => {
            //console.log(res)
            if (res.ok){
                console.log("Deleted post");
            }
            else{
                window.alert("Error Deleting");
            }
        });
    }



function init() {
    console.log("Welcome!");
    document.getElementById("submit").addEventListener("click", StartLogin);  
}
window.onload = init;