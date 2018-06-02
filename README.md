[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6e7b0bb6a8d44d068baf0e5c5f730afd)](https://www.codacy.com/app/fudgemaster3000/YT-Discord-Bot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=cdnexport/YT-Discord-Bot&amp;utm_campaign=Badge_Grade)
# YT-Discord-Bot
## About
Links a youtube video that was linked at one point in the guild.

## Usage
{prefix}yt -> The bot pastes a random youtube link from it's database.

{prefix}yt ### -> Pastes the link that corresponds with ### which is the id of it in the database.

## How to set up
Install nodeJS on the operating system of your choice. I use Ubuntu.

In your terminal run `npm install` in the project directory. This should install the dependencies listed in the Package.json.

Follow the instructions here: https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token on how to set up a bot account.

Rename `config.json.sample` to `config.json`and place your bot token from the previous step in it.

Rename `skeleton.db` to `yt.db`.

In your terminal run `node index.js`. The bot should launch successfully and you should see `Ready!` in your terminal.

If something goes wrong report it to me.
