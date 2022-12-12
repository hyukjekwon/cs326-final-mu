debugger;
window.test = null;
await fetch("/frontpage/posts/getPosts").then(response => response.json()).then(data => window.test = data);
console.log(window.test);