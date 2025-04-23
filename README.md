# whatsapp-bot

**Variables:**

   ```sh
   SESSION_ID=session_id_here
   PREFIX= supports multi
   LANG=en
   MONGODB_URI= url string
   GROK_API= 
   XP_SYSTEM=false/true autolevel
   OWNER_NUM= ×××××××××
   MODS=××××××,××××××,×××××
   GEMINI_API_KEY=
   WORKTYPE= private/public
   ```

6. **Start Bot Using PM2:**

   To start the bot, run:

   ```sh
   pm2 start index.js --name xastarl --attach --time
   ```

   To stop the bot, run:

   ```sh
   pm2 stop xastarl
   ```
