const { Locale } = require("discord.js");
const { GuildConfig, FeaturedMessage, TimerModel, FeaturedEvent, FeaturedThread } = require("../Mongoose/Models.js");
const { DiscordClient } = require("../constants.js");
const { LogError } = require("./LoggingModule.js");
const { refreshMessagesAudio, refreshEventsThreads } = require("./HomeModule.js");


module.exports = {

    /**
     * Removes a featured or highlighted Message from Home Channel after its duration is up
     * 
     * @param {String} guildId 
     * @param {String} messageId 
     * @param {Locale} locale Guild's Locale
     */
    async expireMessage(guildId, messageId, locale)
    {
        // Edge-case: Ensure message hasn't already been removed
        let homeConfig = await GuildConfig.findOne({ guildId: guildId });
        let messageEntry = await FeaturedMessage.findOne({ guildId: guildId, originalMessageId: messageId });
        let fetchedHomeWebhook;

        if ( messageEntry == null ) { return; }

        // Edge-case: Ensure Config exists
        if ( homeConfig == null ) { return; }

        try { fetchedHomeWebhook = await DiscordClient.fetchWebhook(homeConfig.homeWebhookId); }
        catch (err)
        {
            await LogError(err);
            if ( err.name.includes("10015") || err.name.toLowerCase().includes("unknown webhook") )
            {
                await resetHomeSliently(guildId);
                return "WEBHOOK_MISSING";
            }
            else { return "WEBHOOK_NOT_FETCHED"; }
        }

        // Remove Message from Home Channel
        await fetchedHomeWebhook.deleteMessage(messageEntry.featuredMessageId);

        // Remove Message from DB
        await messageEntry.deleteOne();

        // Just in case, remove Message from Timer Table
        await TimerModel.deleteOne({ originalMessageId: messageId });
        
        // Refresh Home Channel to reflect changes
        await refreshMessagesAudio(guildId, locale);

        return;
    },





    /**
     * Removes a featured or highlighted Event from Home Channel after its duration is up
     * 
     * @param {String} guildId 
     * @param {String} eventId 
     * @param {Locale} locale Guild's Locale
     */
    async expireEvent(guildId, eventId, locale)
    {
        // Edge-case: Ensure event hasn't already been removed
        let homeConfig = await GuildConfig.findOne({ guildId: guildId });
        let eventEntry = await FeaturedEvent.findOne({ guildId: guildId, eventId: eventId });

        if ( eventEntry == null ) { return; }

        // Edge-case: Ensure Config exists
        if ( homeConfig == null ) { return; }

        // Remove Event from DB
        await eventEntry.deleteOne();

        // Just in case, remove Event from Timer Table
        await TimerModel.deleteOne({ eventId: eventId });
        
        // Refresh Home Channel to reflect changes
        await refreshEventsThreads(guildId, locale);

        return;
    },
    




    /**
     * Removes a featured or highlighted Thread from Home Channel after its duration is up
     * 
     * @param {String} guildId 
     * @param {String} threadId 
     * @param {Locale} locale Guild's Locale
     */
    async expireThread(guildId, threadId, locale)
    {
        // Edge-case: Ensure thread hasn't already been removed
        let homeConfig = await GuildConfig.findOne({ guildId: guildId });
        let threadEntry = await FeaturedThread.findOne({ guildId: guildId, threadId: threadId });

        if ( threadEntry == null ) { return; }

        // Edge-case: Ensure Config exists
        if ( homeConfig == null ) { return; }

        // Remove Event from DB
        await threadEntry.deleteOne();

        // Just in case, remove Event from Timer Table
        await TimerModel.deleteOne({ threadId: threadId });
        
        // Refresh Home Channel to reflect changes
        await refreshEventsThreads(guildId, locale);

        return;
    }

}
