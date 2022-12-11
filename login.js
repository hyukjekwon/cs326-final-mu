async function StartLogin(){
    const response = await fetch("/userlogin" + document.getElementById("searchbox").value)
        .then((res) => {
            if (res.ok){
                console.log("OKAY");
            }
            else{
                console.log("NOT OKAY");
            }
        });
}



function init() {
    console.log("Welcome!");
    document.getElementById("submit").addEventListener("click", StartLogin);  
}
window.onload = init;