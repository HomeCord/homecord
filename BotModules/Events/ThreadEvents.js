const { ThreadChannel } = require("discord.js");
const { FeaturedThread } = require("../../Mongoose/Models");
const { LogError } = require("../LoggingModule");
const { refreshEventsThreads } = require("../HomeModule");


module.exports = {

    /**
     * Processes Thread Updates
     * @param {ThreadChannel} oldThread 
     * @param {ThreadChannel} newThread 
     */
    async processThreadUpdate(oldThread, newThread)
    {
        // Has Thread been closed/archived?
        if ( oldThread.archived !== newThread.archived )
        {
            // Remove from Home since Thread is now longer open
            await FeaturedThread.deleteOne({ guildId: newThread.guildId, threadId: newThread.id })
            .then(async (oldDocument) => {
                try {

                    // Call method to update Home Channel to reflect removed Thread
                    await refreshEventsThreads(newThread.guildId, newThread.guild.preferredLocale);
                    return;

                }
                catch (err) {
                    await LogError(err);
                    return;
                }
            })
            .catch(async err => {
                await LogError(err);
            });

            return;
        }

        // Nothing was updated
        return;
    }

}
