const { Message, Collection, MessageReaction, User } = require("discord.js");
const { GuildBlocklist, FeaturedMessage, GuildConfig, TimerModel } = require("../../Mongoose/Models");
const { replyThreshold, reactionThreshold } = require("../../Resources/activityThresholds");
const { DiscordClient } = require("../../constants");
const { LogError } = require("../LoggingModule");
const { refreshMessagesAudio } = require("../HomeModule");
const { calculateIsoTimeUntil, calculateUnixTimeUntil, calculateTimeoutDuration } = require("../UtilityModule");
const { localize } = require("../LocalizationModule");
const { expireMessage } = require("../ExpiryModule");
const { resetHomeSliently } = require("../ResetHomeModule");

// Caches
/** Cache of Messages & how many Replies they've had in the past 3 days
 * @type {Collection<String, {messageId: String, replyCount: Number, reactionCount: Number}>}
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
        let blockListFilter = [ { blockedId: message.channelId } ];
        if ( message.channel.parentId != null ) { blockListFilter.push({ blockedId: message.channel.parentId }); }
        if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: blockListFilter }) != null ) { return; }

        // Check if max featured Messages has been reached
        if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 10 ) { return; }

        // Fetch Replied To Message
        const RepliedMessage = await message.channel.messages.fetch(message.reference.messageId);

        // Just in case a Collection is received instead of a Message object
        if ( RepliedMessage?.size > 1 ) { return; }

        // Check if Replied Message is already featured
        if ( await FeaturedMessage.exists({ guildId: message.guildId, originalMessageId: RepliedMessage.id }) != null ) { return; }

        // Ignore replies to own messages
        if ( message.author.id === RepliedMessage.author.id ) { return; }

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
            messageCache = { messageId: RepliedMessage.id, replyCount: 1, reactionCount: 0 };
            
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

            let guildConfig = await GuildConfig.findOne({ guildId: message.guildId });

            // Total of both Replies and Reactions
            let totalActivityCount = messageCache.replyCount + messageCache.reactionCount;
            let totalThreshold = (replyThreshold[guildConfig.activityThreshold] + reactionThreshold[guildConfig.activityThreshold]) / 2;

            // Fetch which Activity Threshold Server uses
            /** @type {Number} */
            let setReplyThreshold = replyThreshold[guildConfig.activityThreshold];
            /** @type {Number} */
            let setReactionThreshold = reactionThreshold[guildConfig.activityThreshold];

            // Check Threshold!
            if ( messageCache.replyCount >= setReplyThreshold || messageCache.reactionCount >= setReactionThreshold || totalActivityCount >= totalThreshold )
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
                    //embeds: RepliedMessage.embeds.length > 0 ? RepliedMessage.embeds : undefined, // Link embeds break with this lol
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
                            //   (adding a .length check to reduce spam-editing the message with the exact same content, while Voice & Stage stuff is WIP)
                            if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 1 ) { await refreshMessagesAudio(message.guildId, message.guild.preferredLocale); }
                        
                            // Timeout for auto-removing the Message
                            setTimeout(async () => { await expireMessage(message.guildId, RepliedMessage.id, message.guild.preferredLocale) }, calculateTimeoutDuration('THREE_DAYS'));
                            
                            MessageActivityCache.delete(RepliedMessage.id); // Delete from cache now that its highlighted
                            
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
    },





    /**
     * Processes Reactions added to a Message
     * 
     * @param {MessageReaction} reaction 
     * @param {User} user 
     */
    async processMessageReaction(reaction, user)
    {
        let message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        // Ignore Bots, System Messages
        if ( message.author.bot ) { return; }
        if ( message.system || message.author.system ) { return; }

        // Safe-guard against Discord outages
        if ( !message.guild.available ) { return; }


        // Check against Block Lists
        let blockListFilter = [ { blockedId: message.channelId } ];
        if ( message.channel.parentId != null ) { blockListFilter.push({ blockedId: message.channel.parentId }); }
        if ( await GuildBlocklist.exists({ guildId: reaction.message.guildId, $or: [ { blockedId: reaction.message.channelId }, { blockedId: reaction.message.channel.parentId } ] }) != null ) { return; }

        // Check if max Featured Messages has been reached
        if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 10 ) { return; }

        // Check if Message is already featured
        if ( await FeaturedMessage.exists({ guildId: message.guildId, originalMessageId: message.id }) != null ) { return; }

        // Ignore Message Authors reacting to their own Messages
        if ( message.author.id === user.id ) { return; }


        // Check Message Author's Roles against Block List
        //    Using an Array as to do the check in one DB call
        let messageMemberRoles = message.member?.roles?.cache;
        let roleFilterArray = [];
        messageMemberRoles.forEach(role => {
            // Filter out atEveryone
            if ( role.id !== message.guildId ) { roleFilterArray.push({ blockedId: role.id }); }
        });

        if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: roleFilterArray }) != null ) { return; }


        // Check if Message is in cache
        let messageCache = MessageActivityCache.get(message.id);
        if ( !messageCache )
        {
            // NOT in cache, create & add to cache
            messageCache = { messageId: message.id, replyCount: 0, reactionCount: 1 };

            // Save to cache
            MessageActivityCache.set(message.id, messageCache);

            // Create timeout to delete after 3 days
            setTimeout(() => { MessageActivityCache.delete(message.id); }, 2.592e+8);

            return;
        }
        else
        {
            // Message IS in cache, add one to reactionCount and check if met Activity Threshold
            messageCache.reactionCount += 1;

            let guildConfig = await GuildConfig.findOne({ guildId: message.guildId });

            // Total of both Replies and Reactions
            let totalActivityCount = messageCache.replyCount + messageCache.reactionCount;
            let totalThreshold = (replyThreshold[guildConfig.activityThreshold] + reactionThreshold[guildConfig.activityThreshold]) / 2;

            // Fetch which Activity Threshold Server uses
            /** @type {Number} */
            let setReplyThreshold = replyThreshold[guildConfig.activityThreshold];
            /** @type {Number} */
            let setReactionThreshold = reactionThreshold[guildConfig.activityThreshold];

            
            // Check Threshold!
            if ( messageCache.replyCount >= setReplyThreshold || messageCache.reactionCount >= setReactionThreshold || totalActivityCount >= totalThreshold )
            {
                
                // Threshold met - highlight Message!
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
                    username: (message.member?.displayName || message.author.displayName),
                    avatarURL: (message.member?.avatarURL({ extension: 'png' }) || message.author.avatarURL({ extension: 'png' })),
                    //embeds: message.embeds.length > 0 ? message.embeds : undefined, // Link embeds broke
                    files: message.attachments.size > 0 ? Array.from(message.attachments.entries()) : undefined,
                    allowedMentions: { parse: [] },
                    // Content is not just a straight copy-paste so that we can add "Featured Message" & Message URL to it
                    content: `**[${localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_TAG')}](<${message.url}>)**${message.content.length > 0 ? `\n\n${message.content.length > 1800 ? `${message.content.slice(0, 1801)}...` : message.content}` : ''}`
                })
                .then(async sentMessage => {

                    // Add to DB
                    await FeaturedMessage.create({
                        guildId: message.guildId,
                        originalMessageId: message.id,
                        featuredMessageId: sentMessage.id,
                        featureType: "HIGHLIGHT",
                        featureUntil: calculateIsoTimeUntil('THREE_DAYS')
                    })
                    .then(async (newDocument) => {
                        await newDocument.save()
                        .then(async () => {
                        
                            // Store callback to remove featured Message from Home Channel after duration (just in case)
                            await TimerModel.create({ timerExpires: calculateUnixTimeUntil('THREE_DAYS'), callback: expireMessage.toString(), guildId: message.guildId, originalMessageId: message.id, featuredMessageId: sentMessage.id, channelId: message.channelId, guildLocale: message.guild.preferredLocale })
                            .then(async newDocument => { await newDocument.save(); })
                            .catch(async err => { await LogError(err); });
                        
                            // Call method to update Home Channel's headers
                            //   (adding a .length check to reduce spam-editing the message with the exact same content, while Voice & Stage stuff is WIP)
                            if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 1 ) { await refreshMessagesAudio(message.guildId, message.guild.preferredLocale); }
                        
                            // Timeout for auto-removing the Message
                            setTimeout(async () => { await expireMessage(message.guildId, message.id, message.guild.preferredLocale) }, calculateTimeoutDuration('THREE_DAYS'));
                            
                            MessageActivityCache.delete(message.id); // Delete from cache now that its highlighted
                            
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
                MessageActivityCache.set(message.id, messageCache);

                return;
            }
        }
    }

}
