const { GuildConfig, FeaturedEvent, FeaturedThread, FeaturedChannel, FeaturedMessage } = require("../Mongoose/Models");
const { Locale } = require("discord.js");
const { DiscordClient } = require("../constants");
const { localize } = require("./LocalizationModule");
const { LogError } = require("./LoggingModule.js");
const { resetHomeSliently } = require("./ResetHomeModule.js");
const { EMOJI_SCHEDULED_EVENTS, EMOJI_CHANNEL_THREAD, EMOJI_CHANNEL_FORUM, EMOJI_BLURPLE_SPARKLES } = require("../Resources/appEmojis.js");



module.exports = {
    /**
     * Refreshes the Header section of the Server's Home Channel, to reflect newly featured, or unfeatured, Channels
     * 
     * @param {String} guildId 
     * @param {Locale} locale Guild's Locale!
     * @param {String} guildName The Guild's Name
     * @param {?String} guildDescription The Guild's Description, if provided
     * 
     * @returns {Promise<Boolean|String>} True for successful refresh, or a String Key Reason for why refreshing failed
     */
    async refreshHeader(guildId, locale, guildName, guildDescription)
    {
        // Just in case
        if ( !locale || locale == null ) { locale = 'en-GB'; }

        // Fetch Database entries and ensure they exist (just in case!)
        const ConfigEntry = await GuildConfig.findOne({ guildId: guildId });
        const FeaturedChannelEntries = await FeaturedChannel.find({ guildId: guildId });

        if ( ConfigEntry == null ) { return "CONFIG_NOT_FOUND"; }

        // Fetch Webhook and make specific Message ID into its own variable for ease
        let headerMessageId = ConfigEntry.headerMessageId;
        let fetchedGuild = await DiscordClient.guilds.fetch(guildId);
        let fetchedHomeWebhook;

        // Just to make sure Discord Outages don't break things
        if ( !fetchedGuild.available ) { return "GUILD_OUTAGE"; }

        try { fetchedHomeWebhook = await DiscordClient.fetchWebhook(ConfigEntry.homeWebhookId); }
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

        // If no Channels are featured, just default message
        if ( FeaturedChannelEntries.length === 0 )
        {
            await fetchedHomeWebhook.editMessage(headerMessageId, { content: `${localize(locale, 'HOME_TITLE', guildName)}\n${guildDescription != null ? `\`\`\`${guildDescription}\`\`\`\n\n${localize(locale, 'HOME_SUBHEADING')}` : localize(locale, 'HOME_SUBHEADING')}` });
            return true;
        }

        // If there are Channels featured
        if ( FeaturedChannelEntries.length > 0 )
        {
            // Convert Entries into UX-friendly strings
            /** @type {Array<String>} */
            let readableChannels = [];

            FeaturedChannelEntries.forEach(async channelDocument => {
                // Format & add to array
                readableChannels.push(`- <#${channelDocument.channelId}>${channelDocument.description != undefined ? `\n  - *${channelDocument.description}*` : ""}`);
            });

            // Set into Home Channel
            await fetchedHomeWebhook.editMessage(headerMessageId, { content: `${localize(locale, 'HOME_TITLE', guildName)}\n${guildDescription != null ? `\`\`\`${guildDescription}\`\`\`\n\n${localize(locale, 'HOME_SUBHEADING')}` : localize(locale, 'HOME_SUBHEADING')}\n\n${localize(locale, 'HOME_FEATURED_CHANNELS_HEADER')}\n\n${readableChannels.join(`\n`)}` });
            return true;
        }
    },





    /**
     * Refreshes the Events & Threads section of the Server's Home Channel, to reflect newly featured or expired Events/Threads/Posts
     * 
     * @param {String} guildId 
     * @param {Locale} locale Guild's Locale!
     * 
     * @returns {Promise<Boolean|String>} True for successful refresh, or a String Key Reason for why refreshing failed
     */
    async refreshEventsThreads(guildId, locale)
    {
        // Just in case
        if ( !locale || locale == null ) { locale = 'en-GB'; }

        // Fetch Database entries and ensure they exist (just in case!)
        const ConfigEntry = await GuildConfig.findOne({ guildId: guildId });
        const FeaturedEventEntries = await FeaturedEvent.find({ guildId: guildId });
        const FeaturedThreadEntries = await FeaturedThread.find({ guildId: guildId });

        if ( ConfigEntry == null ) { return "CONFIG_NOT_FOUND"; }

        // Fetch Webhook and make specific Message ID into its own variable for ease
        let eventThreadsMessageId = ConfigEntry.eventThreadsMessageId;
        let fetchedGuild = await DiscordClient.guilds.fetch(guildId);
        let fetchedHomeWebhook;

        // Just to make sure Discord Outages don't break things
        if ( !fetchedGuild.available ) { return "GUILD_OUTAGE"; }

        try { fetchedHomeWebhook = await DiscordClient.fetchWebhook(ConfigEntry.homeWebhookId); }
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

        // If no Events or Threads are featured, just empty message
        if ( FeaturedEventEntries.length === 0 && FeaturedThreadEntries.length === 0 )
        {
            await fetchedHomeWebhook.editMessage(eventThreadsMessageId, { content: `\u200B` });
            return true;
        }

        // If only Events are featured
        if ( FeaturedEventEntries.length > 0 && FeaturedThreadEntries.length === 0 )
        {
            // Convert Entries into UX-friendly strings
            /** @type {Array<String>} */
            let readableEvents = [];

            FeaturedEventEntries.forEach(async eventDocument => {
                // Grab Event's name
                let tempEvent = fetchedGuild.scheduledEvents.resolve(eventDocument.eventId);
                // Tweak formatting depending on highlighted or featured
                if ( eventDocument.featureType === "FEATURE" ) { readableEvents.push(`- ${EMOJI_SCHEDULED_EVENTS} **${tempEvent.name} - <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:f> <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:R> ${EMOJI_BLURPLE_SPARKLES} ${localize(locale, 'HOME_FEATURED_EVENT_TAG')}**`); }
                else { readableEvents.push(`- ${EMOJI_SCHEDULED_EVENTS} ${tempEvent.name} - <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:f> <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:R>`); }
            });

            // Set into Home Channel
            await fetchedHomeWebhook.editMessage(eventThreadsMessageId, { content: `${localize(locale, 'HOME_SCHEDULED_EVENTS_HEADER')}\n\n${readableEvents.join(`\n`)}` });
            return true;
        }

        // If only Threads are featured
        if ( FeaturedEventEntries.length === 0 && FeaturedThreadEntries.length > 0 )
        {
            // Convert Entries into UX-friendly strings
            /** @type {Array<String>} */
            let readableThreads = [];

            FeaturedThreadEntries.forEach(async threadDocument => {
                // Tweak formatting depending on highlighted or featured
                if ( threadDocument.featureType === "FEATURE" ) { readableThreads.push(`- ${threadDocument.threadType === "THREAD" ? `${EMOJI_CHANNEL_THREAD}` : `${EMOJI_CHANNEL_FORUM}`} **<#${threadDocument.threadId}> ${EMOJI_BLURPLE_SPARKLES} ${threadDocument.threadType === "THREAD" ? `${localize(locale, 'HOME_FEATURED_THREAD_TAG')}` : `${localize(locale, 'HOME_FEATURED_POST_TAG')}`}**`) }
                else { readableThreads.push(`- ${threadDocument.threadType === "THREAD" ? `${EMOJI_CHANNEL_THREAD}` : `${EMOJI_CHANNEL_FORUM}`} <#${threadDocument.threadId}>`) }
            });

            // Set into Home Channel
            await fetchedHomeWebhook.editMessage(eventThreadsMessageId, { content: `${localize(locale, 'HOME_ACTIVE_THREADS_HEADER')}\n\n${readableThreads.join(`\n`)}` });
            return true;
        }

        // If both are featured
        if ( FeaturedEventEntries.length > 0 && FeaturedThreadEntries.length > 0 )
        {
            // Convert Entries into UX-friendly strings
            /** @type {Array<String>} */
            let readableEvents = [];
            /** @type {Array<String>} */
            let readableThreads = [];

            FeaturedEventEntries.forEach(async eventDocument => {
                // Grab Event's name
                let tempEvent = fetchedGuild.scheduledEvents.resolve(eventDocument.eventId);
                // Tweak formatting depending on highlighted or featured
                if ( eventDocument.featureType === "FEATURE" ) { readableEvents.push(`- ${EMOJI_SCHEDULED_EVENTS} **${tempEvent.name} - <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:f> <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:R> ${EMOJI_BLURPLE_SPARKLES} ${localize(locale, 'HOME_FEATURED_EVENT_TAG')}**`); }
                else { readableEvents.push(`- ${EMOJI_SCHEDULED_EVENTS} ${tempEvent.name} - <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:f> <t:${Math.floor(tempEvent.scheduledStartAt.getTime() / 1000)}:R>`); }
            });

            FeaturedThreadEntries.forEach(async threadDocument => {
                // Tweak formatting depending on highlighted or featured
                if ( threadDocument.featureType === "FEATURE" ) { readableThreads.push(`- ${threadDocument.threadType === "THREAD" ? `${EMOJI_CHANNEL_THREAD}` : `${EMOJI_CHANNEL_FORUM}`} **<#${threadDocument.threadId}> ${EMOJI_BLURPLE_SPARKLES} ${threadDocument.threadType === "THREAD" ? `${localize(locale, 'HOME_FEATURED_THREAD_TAG')}` : `${localize(locale, 'HOME_FEATURED_POST_TAG')}`}**`) }
                else { readableThreads.push(`- ${threadDocument.threadType === "THREAD" ? `${EMOJI_CHANNEL_THREAD}` : `${EMOJI_CHANNEL_FORUM}`} <#${threadDocument.threadId}>`) }
            });

            // Set into Home Channel
            await fetchedHomeWebhook.editMessage(eventThreadsMessageId, { content: `${localize(locale, 'HOME_SCHEDULED_EVENTS_HEADER')}\n\n${readableEvents.join(`\n`)}\n\n${localize(locale, 'HOME_ACTIVE_THREADS_HEADER')}\n\n${readableThreads.join(`\n`)}` });
            return true;
        }
    },
    




    /**
     * Refreshes the Stages, Voice, and Messages section of the Server's Home Channel
     * 
     * @param {String} guildId 
     * @param {Locale} locale Guild's Locale!
     * 
     * @returns {Promise<Boolean|String>} True for successful refresh, or a String Key Reason for why refreshing failed
     */
    async refreshMessagesAudio(guildId, locale)
    {
        // Just in case
        if ( !locale || locale == null ) { locale = 'en-GB'; }

        // Fetch Database entries and ensure they exist (just in case!)
        const ConfigEntry = await GuildConfig.findOne({ guildId: guildId });
        const FeaturedMessages = await FeaturedMessage.find({ guildId: guildId });

        if ( ConfigEntry == null ) { return "CONFIG_NOT_FOUND"; }

        // Fetch Webhook and make specific Message ID into its own variable for ease
        let audioMessageId = ConfigEntry.audioMessageId;
        let fetchedGuild = await DiscordClient.guilds.fetch(guildId);
        let fetchedHomeWebhook;

        // Just to make sure Discord Outages don't break things
        if ( !fetchedGuild.available ) { return "GUILD_OUTAGE"; }

        try { fetchedHomeWebhook = await DiscordClient.fetchWebhook(ConfigEntry.homeWebhookId); }
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

        // Now fetch any live Stage instances, and active Voice Channels
        //   TO BE ADDED AT A LATER DATE - WHEN I CAN FIGURE OUT A DECENT WAY TO FETCH ALL LIVE STAGE INSTANCES AND ALL ACTIVE VOICE CHANNELS
        //   ...WITHOUT HAVING TO DO TOO MUCH .filter() OR WHATEVER AHHHHHHH


        // If no Messages featured, remove header. Otherwise, add Header
        if ( FeaturedMessages.length === 0 )
        {
            await fetchedHomeWebhook.editMessage(audioMessageId, { content: `\u200B` });
            return true;
        }


        if ( FeaturedMessages.length > 0 )
        {
            await fetchedHomeWebhook.editMessage(audioMessageId, { content: `${localize(locale, 'HOME_FEATURED_MESSAGES_HEADER')}` });
            return true;
        }
    }
}
