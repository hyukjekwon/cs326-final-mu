# Database Layout

## Posts Table

| Column     |  Type    | Description |
| --- | --- | --- |
postid           | bigint    |   Stores a unique postID for a post.
username     | text       |  Stores the username associated with a post.
time              | text       |  Stores a string that represents when the post was created.
title               | text       |  Stores the title of a post, defined by the user.
body             | text       |  Stores the body of a post, can be empty.
likes              | integer |  Stores the amount of likes that a post has.
dislikes         | integer |  Stores the amount of dislikes that a post has.
replies           | json      |  Stores every reply for a post in the format [{".time.": 1668980806051, "Username": "Message"}] where “.time.” is a number that represents when the reply was posted and “Username” is the username of the person making the reply. 
audiofile        | text       |   Stores the path to an audiofile associated with a post.
lastreplytime | bigint    |   Stores a number representing the time the most recent reply to a post was made.

## User Table
| Column | Type | Description |
| --- | --- | --- |
username|text| String username.
salt|text| The user specific salt prepended to the supplied password.
hash|text| Hash of salt + password.


# Division of Labor: 

- Austin:
    - Connected the forum to a heroku database (using the posts table)
    - Implemented CRUD operations for posts, i.e. creating posts, deleting posts, replying to a post, searching for a post, and liking/disliking a post. 
- Hyuk-Je:
    - Made bug fixes to looper.
    - Made Tone.js usage more efficient.
    - Redid looper interface to make it more intuitive.
- Guy:
    - Created user creation and login functionality with user sessions to serve user-specific content.