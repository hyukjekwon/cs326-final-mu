import { createServer } from 'http';
import { parse } from 'url';
 
function basicServer(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'}); // we're sending HTML                                                       
    res.write('Hello World!<BR>'); //write a response to the client                                                                
    const requestedURL = req.url;
    res.write(`URL is <B>${requestedURL+"foo"}</B><BR>`); // template string (backquote)                                                 
    const parsedURL = parse(requestedURL, true);
    const query = parsedURL.query;
    const pathname = parsedURL.pathname;
    res.write(`path is <B>${JSON.stringify(pathname)}</B><BR>`);
    res.write(`query components are <B>${JSON.stringify(query)}</B><BR>`);
    if (Number.parseInt(query.age) >= 21) {
      res.write('DRINK UP!<BR>');
    } else {
      res.write('STAY SOBER KIDS!<BR>');
    }
    res.end(); //end the response                                                                                                  
}
 
// Start the server                                                                                                                
createServer(basicServer).listen(80); //the server object listens on port 80