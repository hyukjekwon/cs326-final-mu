async function StartRegister(){
    await fetch('/userregister', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"username":document.getElementById("username").value, "password":document.getElementById("password").value})
        }).then((res) => {
            if (res.ok){
                window.location = 'frontpage'
            }
            else{
                window.alert("Username already taken");
                console.log(res);
            }
        });
    }



function init() {
    console.log("Welcome!");
    document.getElementById("submit").addEventListener("click", StartRegister);  
}
window.onload = init;