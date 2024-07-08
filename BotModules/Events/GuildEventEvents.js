const { User, GuildScheduledEvent, GuildScheduledEventStatus, Collection, Routes } = require("discord.js");
const { GuildConfig, TimerModel, FeaturedEvent } = require("../../Mongoose/Models");
const { eventThreshold } = require("../../Resources/activityThresholds");
const { DiscordClient } = require("../../constants");
const { LogError } = require("../LoggingModule");
const { refreshEventsThreads } = require("../HomeModule");
const { calculateIsoTimeUntil, calculateUnixTimeUntil, calculateTimeoutDuration } = require("../UtilityModule");
const { expireEvent } = require("../ExpiryModule");
const { resetHomeSliently } = require("../ResetHomeModule");


/** Cache for highlighting Scheduled Events, to reduce spam caused by bulk-registering of many User's interest in Event!
 * @type {Collection<String, String>}
 */
const EventCache = new Collection();


module.exports = {

    /**
     * Processes Scheduled Event User Adds
     * @param {GuildScheduledEvent} scheduledEvent 
     * @param {User} user User who registered interest in the Scheduled Event
     */
    async processGuildEventUserAdd(scheduledEvent, user)
    {
        // If in cache, return early
        if ( EventCache.has(scheduledEvent.id) ) { return; }

        // Not in cache, so add it now
        EventCache.set(scheduledEvent.id, scheduledEvent.id);

        // Make a Timeout for cache (of 2 hours)
        setTimeout(() => { EventCache.delete(scheduledEvent.id); }, 7.2e+6);

        // Safe-guard against Discord outages
        if ( !scheduledEvent.guild?.available ) { return; }

        // Grab count of Users registering interest in Event because for some reason DJS NEVER LETS THE FLUFFING `.userCount` FIELD BE AN INTEGER - IT'S ALWAYS NULL EVEN IF FETCHED WTH DJS!?
        let refetchedEvent = await DiscordClient.rest.get(Routes.guildScheduledEvent(scheduledEvent.guildId, scheduledEvent.id), { query: "with_user_count=true" });
        let eventUserCount = refetchedEvent.user_count;


        // Ensure Scheduled Event is still in planned state
        if ( scheduledEvent.status !== GuildScheduledEventStatus.Scheduled ) { return; }

        // Check if max featured Scheduled Events has been reached
        if ( (await FeaturedEvent.find({ guild: scheduledEvent.guildId })).length === 3 ) { return; }
        
        // Check if Scheduled Event is already on Home
        if ( await FeaturedEvent.exists({ guildId: scheduledEvent.guildId, eventId: scheduledEvent.id }) != null ) { return; }
        

        // Check against Activity Threshold
        let guildConfig = await GuildConfig.findOne({ guildId: scheduledEvent.guildId });

        /** @type {Number} */
        let setEventThreshold = eventThreshold[guildConfig.eventActivity];

        if ( eventUserCount >= setEventThreshold )
        {
            // Threshold met = Highlight Scheduled Event!
            // Grab Webhook
            let HomeWebhook;
            try { HomeWebhook = await DiscordClient.fetchWebhook(guildConfig.homeWebhookId); }
            catch (err) {
                await LogError(err);
                if ( err.name.includes("10015") || err.name.toLowerCase().includes("unknown webhook") )
                { 
                    await resetHomeSliently(scheduledEvent.guildId);
                    return;
                }
                else { return; }
            }


            // Add to database
            await FeaturedEvent.create({
                guildId: scheduledEvent.guildId,
                eventId: scheduledEvent.id,
                featureType: "HIGHLIGHT",
                featureUntil: (guildConfig.eventActivity === 'VERY_LOW' || guildConfig.eventActivity === 'LOW') ? calculateIsoTimeUntil('SEVEN_DAYS') : guildConfig.eventActivity === 'MEDIUM' ? calculateIsoTimeUntil('FIVE_DAYS') : calculateIsoTimeUntil('THREE_DAYS')
            })
            .then(async (newDocument) => {
                await newDocument.save()
                .then(async () => {

                    // Store callback to remove featured Event from Home after duration (just in case)
                    await TimerModel.create({
                        timerExpires: (guildConfig.eventActivity === 'VERY_LOW' || guildConfig.eventActivity === 'LOW') ? calculateUnixTimeUntil('SEVEN_DAYS') : guildConfig.eventActivity === 'MEDIUM' ? calculateUnixTimeUntil('FIVE_DAYS') : calculateUnixTimeUntil('THREE_DAYS'),
                        callback: expireEvent.toString(),
                        guildId: scheduledEvent.guildId,
                        eventId: scheduledEvent.id,
                        guildLocale: scheduledEvent.guild.preferredLocale
                    })
                    .then(async newDocument => {await newDocument.save();})
                    .catch(async err => { await LogError(err); });
                    
                    // Call method to update Home to reflect newly highlighted Scheduled Event!
                    await refreshEventsThreads(scheduledEvent.guildId, scheduledEvent.guild.preferredLocale);
                    
                    // Timeout for auto-removing the highlighted Scheduled Event
                    setTimeout(async () => { await expireEvent(scheduledEvent.guildId, scheduledEvent.id, scheduledEvent.guild.preferredLocale) }, (guildConfig.eventActivity === 'VERY_LOW' || guildConfig.eventActivity === 'LOW') ? calculateTimeoutDuration('SEVEN_DAYS') : guildConfig.eventActivity === 'MEDIUM' ? calculateTimeoutDuration('FIVE_DAYS') : calculateTimeoutDuration('THREE_DAYS'));
                    
                    return;
                })
                .catch(async err => {
                    await LogError(err);
                    return;
                });
            })
            .catch(async err => {
                await LogError(err);
                return;
            });
        }
        
        return;
    },









    /**
     * Processes Scheduled Event Updates
     * @param {?GuildScheduledEvent} oldScheduledEvent 
     * @param {GuildScheduledEvent} newScheduledEvent 
     */
    async processGuildEventUpdate(oldScheduledEvent, newScheduledEvent)
    {
        // Was it Event Name, Event Start Time, or Event Status that was updated? Reject if neither was updated
        if ( (oldScheduledEvent.name !== newScheduledEvent.name) || (oldScheduledEvent.scheduledStartTimestamp !== newScheduledEvent.scheduledStartTimestamp) )
        {
            // NAME OR START TIME WAS UPDATED
            //   Just re-run the refresh method, that will auto-update the displayed Event Name & Start Time
            await refreshEventsThreads(newScheduledEvent.guildId, newScheduledEvent.guild?.preferredLocale);
            return;
        }

        if ( oldScheduledEvent.status !== newScheduledEvent.status )
        {
            // STATUS WAS UPDATED
            //   Check if cancelled or just going live. If anything other than cancelled/expired, do nothing
            if ( newScheduledEvent.status === GuildScheduledEventStatus.Canceled || newScheduledEvent.status === GuildScheduledEventStatus.Completed )
            {
                // Remove from Home
                await FeaturedEvent.deleteOne({ guildId: newScheduledEvent.guildId, eventId: newScheduledEvent.id })
                .then(async (oldDocument) => {
                    try {

                        // Call method to update Home Channel to reflect removed Event
                        await refreshEventsThreads(newScheduledEvent.guildId, newScheduledEvent.guild?.preferredLocale);
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
            }

            return;
        }

        // Nothing was updated
        return;
    }

}
