const { Message, Collection } = require("discord.js");
const { GuildBlocklist, FeaturedMessage, GuildConfig, TimerModel } = require("../../Mongoose/Models");
const { messageThreshold } = require("../../Resources/activityThresholds");
const { DiscordClient } = require("../../constants");
const { LogError } = require("../LoggingModule");
const { resetHomeSliently, expireMessage, refreshMessagesAudio } = require("../HomeModule");
const { calculateIsoTimeUntil, calculateUnixTimeUntil, calculateTimeoutDuration } = require("../UtilityModule");
const { localize } = require("../LocalizationModule");

// Caches
/** Cache of Messages & how many Replies they've had in the past 3 days
 * @type {Collection<String, {messageId: String, replyCount: Number}>}
 */
const MessageActivityCache = new Collection();
/** Cache of Threads & how many Messages they've had in the past 3 days
 * @type {Collection<String, {threadId: String, messageCount: Number}}
 */
const ThreadActivityCache = new Collection();

module.exports = {

    /**
     * Processes Messages that are in direct reply to another Message
     * @param {Message} message 
     */
    async processMessageReply(message)
    {
        // Check Channel/Category Block List
        if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: [ { blockedId: message.channelId }, { blockedId: message.channel.parentId } ] }) != null ) { return; }

        // Check if max featured Messages has been reached
        if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 10 ) { return; }

        // Fetch Replied To Message
        const RepliedMessage = await message.channel.messages.fetch(message.reference.messageId);

        // Just in case a Collection is received instead of a Message object
        if ( RepliedMessage?.size > 1 ) { return; }

        // Check if Replied Message is already featured
        if ( await FeaturedMessage.exists({ guildId: message.guildId, originalMessageId: RepliedMessage.id }) != null ) { return; }

        // Check Replied Message Author's Roles against Block List
        //   Using an Array as to do the check in one DB call
        let repliedMemberRoles = RepliedMessage.member?.roles?.cache;
        let roleFilterArray = [];
        repliedMemberRoles.forEach(role => {
            // Filter out atEveryone
            if ( role.id !== message.guildId ) { roleFilterArray.push({ blockedId: role.id }); }
        });

        if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: roleFilterArray }) != null ) { return; }


        // Check if Message is in cache
        let messageCache = MessageActivityCache.get(RepliedMessage.id);
        if ( !messageCache )
        {
            // Message is NOT in cache, create object to add to Cache
            messageCache = { messageId: RepliedMessage.id, replyCount: 1 };
            
            // Save to cache
            MessageActivityCache.set(RepliedMessage.id, messageCache);

            // Create timeout to delete after 3 days
            setTimeout(() => { MessageActivityCache.delete(RepliedMessage.id); }, 2.592e+8);

            return;
        }
        else
        {
            // Message IS in cache, add one to replyCount and check if met Activity Threshold
            messageCache.replyCount += 1;

            // Grab Reactions on the message so we can use that, along with replyCount, to see if Threshold is met
            let reactionCount = 0;
            RepliedMessage.reactions.cache.forEach(reaction => { reactionCount += reaction.count; });

            // Total of both Replies and Reactions
            let totalActivityCount = messageCache.replyCount + reactionCount;

            // Fetch which Activity Threshold Server uses
            let guildConfig = await GuildConfig.findOne({ guildId: message.guildId });
            /** @type {Number} */
            let setThreshold = messageThreshold[guildConfig.activityThreshold];

            // Check Threshold!
            if ( messageCache.replyCount >= setThreshold || reactionCount >= setThreshold || totalActivityCount >= setThreshold )
            {

                // Threshold met - Highlight Message!
                // Grab Webhook
                let HomeWebhook;
                try { HomeWebhook = await DiscordClient.fetchWebhook(guildConfig.homeWebhookId); }
                catch (err) {
                    await LogError(err);
                    if ( err.name.includes("10015") || err.name.toLowerCase().includes("unknown webhook") )
                    { 
                        await resetHomeSliently(message.guildId);
                        return;
                    }
                    else { return; }
                }

                // Cross-post Message to Home Channel
                await HomeWebhook.send({
                    username: (RepliedMessage.member?.displayName || RepliedMessage.author.displayName),
                    avatarURL: (RepliedMessage.member?.avatarURL({ extension: 'png' }) || RepliedMessage.author.avatarURL({ extension: 'png' })),
                    embeds: RepliedMessage.embeds.length > 0 ? RepliedMessage.embeds : undefined,
                    files: RepliedMessage.attachments.size > 0 ? Array.from(RepliedMessage.attachments.entries()) : undefined,
                    allowedMentions: { parse: [] },
                    // Content is not just a straight copy-paste so that we can add "Featured Message" & Message URL to it
                    content: `**[${localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_TAG')}](<${RepliedMessage.url}>)**${RepliedMessage.content.length > 0 ? `\n\n${RepliedMessage.content.length > 1800 ? `${RepliedMessage.content.slice(0, 1801)}...` : RepliedMessage.content}` : ''}`
                })
                .then(async sentMessage => {

                    // Add to DB
                    await FeaturedMessage.create({
                        guildId: message.guildId,
                        originalMessageId: RepliedMessage.id,
                        featuredMessageId: sentMessage.id,
                        featureType: "HIGHLIGHT",
                        featureUntil: calculateIsoTimeUntil('THREE_DAYS')
                    })
                    .then(async (newDocument) => {
                        await newDocument.save()
                        .then(async () => {
                        
                            // Store callback to remove featured Message from Home Channel after duration (just in case)
                            await TimerModel.create({ timerExpires: calculateUnixTimeUntil('THREE_DAYS'), callback: expireMessage.toString(), guildId: message.guildId, originalMessageId: RepliedMessage.id, featuredMessageId: sentMessage.id, channelId: message.channelId, guildLocale: message.guild.preferredLocale })
                            .then(async newDocument => { await newDocument.save(); })
                            .catch(async err => { await LogError(err); });
                        
                            // Call method to update Home Channel's headers
                            await refreshMessagesAudio(message.guildId, message.guild.preferredLocale);
                        
                            // Timeout for auto-removing the Message
                            setTimeout(async () => { await expireMessage(message.guildId, RepliedMessage.id, message.guild.preferredLocale) }, calculateTimeoutDuration('THREE_DAYS'));
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

                })
                .catch(async err => {
                    await LogError(err);
                    return;
                });

                return;

            }
            else
            {
                // Threshold not met
                // Save to cache
                MessageActivityCache.set(RepliedMessage.id, messageCache);

                return;
            }
        }
    }

}
