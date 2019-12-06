# Dockerbot

## About
No, not that docker 🐳. Dockerbot is a Twitch chatbot that allows a streamer to dock other streams onto theirs as a video overlay. It can also be used as an overlay to easily add streams without the chatbot. The overall look of the dock placeholders and usernames is inspired by an old website called Stickam. I created this to bring some of that functionality to Twitch. I also wanted to learn Electron. This was thrown together as a side project, a lot of critiques could be made but I think it is useable and a reasonably good example on tying together Electron and React. You can see a demo of it [here](https://www.youtube.com/watch?v=XO8vQ4i3BuI) and a code overview [here](https://www.youtube.com/watch?v=BamaaqzUrsY).

Per using Electron it runs on Windows, MacOS and Linux.

## Technologies

* Node - JavaScript runtime
* Electron - Crossplatform desktop UI
* React - Dynamic and performant HTML/CSS rendering
* Babel - Transpile React JSX and allow for modern JavaScript features.
* Webpack - Used with Babel loader to transpile and bundle dependencies for Electron render process, Electron main process and React JSX.
* Electron Packager - Used to package everything into an executable that can run on a desktop.
* Gulp - Task runner to automate restarting the application on file changes during development and the build command to run Electron Packager.
* TMI - Library for creating Twitch IRC chatbots.

## Commands

* !dock - docks a chat users stream
* !undock - undocks a chat users stream
* !docked - returns a list of the users currently docked
* !dockhost - the chatbot joins the rooms of the users who are docked, this command returns the URL of stream using the Dockerbot overlay
* !commands - lists all the commands