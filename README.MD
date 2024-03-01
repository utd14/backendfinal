# Portfolio Website
This is a portfolio website with user authentication system and admin rights.

## Setup Instruction
Make sure you have the following installed on your machine:

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
\
— Node.js LTS: [Download](https://nodejs.org/en)
\
— MongoDB Database [Register](https://www.mongodb.com/)
\
— (Optional) Visual Studio Code: [Download](https://code.visualstudio.com/)
\
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

If you're experiencing troubles with packages, make sure they're installed. In Visual Studio Code they can be installed through the terminal.
\
— `> npm install`
\
The following dependencies will be used:


    "axios": "^1.6.7",
    "bcrypt": "^5.1.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-session": "^1.18.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.2.0",
    "nodemailer": "^6.9.10",
    "nodemailer-smtp-transport": "^2.4.2"

## Using the website
1. Start the website with `> node server.js`.
2. Go to `localhost:3000`.
3. Register an account with a real e-mail or login with an already existing one. You can also send a request for password recovery.
4. Check your e-mail for a welcome message if you registered an account.
5. Log in and procceed to the home page.
6. If you're logged with an admin account, you can see an option to edit the portfolio in the navbar.
7. In the editing page, you can add, edit and delete items.

## Troubleshooting
If you're encountering error `EADDRINUSE: address already in use :::4000`, do the following:

### On Windows:
1. Open the Command Prompt.
2. Run the following command to find the process ID (PID) using your port: `netstat -ano | find "yourport"`.
3. Use the following command to kill the process: `taskkill /F /PID <PID>`. (Replace <PID> with the actual process ID you obtained.)
4. Try running your Node.js application again using: `node server.js`.

### On Linux:
1. Open the terminal.
2. Run the following command to find the process ID (PID) using your port: `lsof -i :yourport`.
3. Use the following command to kill the process: `kill -9 <PID>`. (Replace <PID> with the actual process ID you obtained.)
4. Try running your Node.js application again using: `node server.js`.

For any other issues:
- Ensure that all applications and dependencies are installed.
- Ensure that `server.js` is running (`> node server.js`).