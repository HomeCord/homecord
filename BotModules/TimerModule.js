const { TimerModel } = require("../Mongoose/Models.js");
const { expireMessage, expireEvent, expireThread } = require("./HomeModule");
const { LogError } = require("./LoggingModule");


module.exports = {
    /**
     * Fetches and restarts all Timers stored on DB while Bot is booting up
     */
    async restartTimersOnStartup()
    {
        // Fetch Timers & current UNIX timestamp
        let fetchedTimers = await TimerModel.find();
        const now = Date.now();

        // If no timers, abort early
        if ( fetchedTimers.length < 1 ) { return; }

        // Loop through all the timers
        fetchedTimers.forEach(async timerObj => {
            // Check if expiry is BEFORE now.
            //  If yes, run the callback
            //  If no, restart its setInterval()
            
            if ( timerObj.timerExpires < now )
            {
                // Expired timer, run callback (depending on callback included)
                if ( timerObj.callback.includes("expireMessage") )
                {
                    try { await expireMessage(timerObj.guildId, timerObj.originalMessageId, timerObj.guildLocale); }
                    catch (err) { await LogError(err); }
                }
                else if ( timerObj.callback.includes("expireEvent") )
                {
                    try { await expireEvent(timerObj.guildId, timerObj.eventId, timerObj.guildLocale); }
                    catch (err) { await LogError(err); }
                }
                else if ( timerObj.callback.includes("expireThread") )
                {
                    try { await expireThread(timerObj.guildId, timerObj.threadId, timerObj.guildLocale); }
                    catch (err) { await LogError(err); }
                }
            }
            else
            {
                // Grab time left
                let timeLeft = timerObj.timerExpires - now;

                // Pending timer, setInternal() again (depending on callback included)
                if ( timerObj.callback.includes("expireMessage") )
                {
                    try { setInterval(expireMessage, timeLeft, timerObj.guildId, timerObj.originalMessageId, timerObj.guildLocale) }
                    catch (err) { await LogError(err); }
                }
                else if ( timerObj.callback.includes("expireEvent") )
                {
                    try { setInterval(expireEvent, timeLeft, timerObj.guildId, timerObj.eventId, timerObj.guildLocale) }
                    catch (err) { await LogError(err); }
                }
                else if ( timerObj.callback.includes("expireThread") )
                {
                    try { setInterval(expireThread, timeLeft, timerObj.guildId, timerObj.threadId, timerObj.guildLocale) }
                    catch (err) { await LogError(err); }
                }
            }

        });

        return;
    }
}
