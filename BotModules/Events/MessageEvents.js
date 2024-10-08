const { Message, Collection, MessageReaction, User, AttachmentBuilder, ChannelType, MessageType, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { GuildBlocklist, FeaturedMessage, GuildConfig, TimerModel, FeaturedThread } = require("../../Mongoose/Models");
const { replyThreshold, reactionThreshold, threadThreshold } = require("../../Resources/activityThresholds");
const { DiscordClient } = require("../../constants");
const { LogError } = require("../LoggingModule");
const { refreshMessagesAudio, refreshEventsThreads } = require("../HomeModule");
const { calculateIsoTimeUntil, calculateUnixTimeUntil, calculateTimeoutDuration } = require("../UtilityModule");
const { localize } = require("../LocalizationModule");
const { expireMessage, expireThread } = require("../ExpiryModule");
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

// Just for reducing spam caused by bulk-additions of Reactions to Messages!
/** @type {Collection<String, {thresholdMet: Boolean}>} */
const MessageCooldown = new Collection();

// Disallowed Message Types for highlighting
const DisallowedMessageTypes = [ MessageType.AutoModerationAction, MessageType.Call, MessageType.ChannelFollowAdd, MessageType.ChannelIconChange,
    MessageType.ChannelNameChange, MessageType.ChannelPinnedMessage, MessageType.ChatInputCommand, MessageType.ContextMenuCommand, MessageType.GuildApplicationPremiumSubscription,
    MessageType.GuildBoost, MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3, MessageType.GuildDiscoveryDisqualified,
    MessageType.GuildDiscoveryGracePeriodFinalWarning, MessageType.GuildDiscoveryGracePeriodInitialWarning, MessageType.GuildDiscoveryRequalified,
    MessageType.GuildInviteReminder, MessageType.InteractionPremiumUpsell, MessageType.RecipientAdd, MessageType.RecipientRemove, MessageType.RoleSubscriptionPurchase,
    MessageType.StageEnd, MessageType.StageRaiseHand, MessageType.StageSpeaker, MessageType.StageStart, MessageType.StageTopic, MessageType.ThreadCreated,
    MessageType.UserJoin ];

// Allowed File Content Types for showcased Message Attachments
const AllowedContentTypes = [ "image/png", "image/jpeg", "image/gif" ];

module.exports = {

    /**
     * Processes Messages that are in direct reply to another Message
     * @param {Message} message 
     */
    async processMessageReply(message)
    {
        // Ignore Bots, System Messages, and other disallowed Message types
        if ( message.author.bot ) { return; }
        if ( message.system || message.author.system ) { return; }
        if ( DisallowedMessageTypes.includes(message.type) ) { return; }

        // Safe-guard against Discord outages
        if ( !message.guild.available ) { return; }


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

        // Ensure Replied Message is not too old
        if ( (Date.now() - RepliedMessage.createdAt.getTime()) > 6.048e+8 ) { return; }

        // Check Replied Message Author's Roles against Block List
        //   Using an Array as to do the check in one DB call
        let repliedMemberRoles = RepliedMessage.member == null ? (await RepliedMessage.guild.members.fetch(RepliedMessage.author.id)).roles.cache : RepliedMessage.member.roles.cache;
        let roleFilterArray = [];
        
        repliedMemberRoles.forEach(role => {
            // Filter out atEveryone
            if ( role.id !== message.guildId ) { roleFilterArray.push({ blockedId: role.id }); }
        });

        // Don't run the Role Block List check if the Member doesn't have any Roles! (Excluding atEveryone)
        if ( roleFilterArray.length > 0 )
        {
            if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: roleFilterArray }) != null ) { return; }
        }


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
            let totalThreshold = Math.ceil((replyThreshold[guildConfig.messageActivity] + reactionThreshold[guildConfig.messageActivity]) / 2);

            // Fetch which Activity Threshold Server uses
            /** @type {Number} */
            let setReplyThreshold = replyThreshold[guildConfig.messageActivity];
            /** @type {Number} */
            let setReactionThreshold = reactionThreshold[guildConfig.messageActivity];

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


                // If attachments in original messages, do thing
                let originalAttachments = [];
                let containsUnsupportedAttachments = false;

                if ( RepliedMessage.attachments.size > 0 && RepliedMessage.poll == null ) {
                    RepliedMessage.attachments.forEach(attachment => {
                        if ( !AllowedContentTypes.includes(attachment.contentType) ) { containsUnsupportedAttachments = true; }
                        else if ( attachment.spoiler === true ) { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setSpoiler(attachment.spoiler).setName(attachment.name) ); }
                        else { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setName(attachment.name) ); }
                    });
                }


                // Message content to cross-post (changes depending on if it is a Poll or not, and if it is Highlighted or Featured)
                //   Include a Link Button to link back to source Message
                let crosspostMessage = "";

                const ButtonMessageLink = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(RepliedMessage.url);
                
                if ( RepliedMessage.poll == null )
                {
                    crosspostMessage = `${RepliedMessage.content.length > 0 ?
                        `${RepliedMessage.content.length > 1990 ? `${RepliedMessage.content.slice(0, 1991)}...` : RepliedMessage.content}`
                        : containsUnsupportedAttachments ? `${RepliedMessage.attachments.first()?.url}` : ''}`;

                    // Button Label depends on Attachments (if any)
                    if ( RepliedMessage.content !== '' && originalAttachments.length === 0 && containsUnsupportedAttachments ) { ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_AND_ATTACHMENT_TAG')); }
                    else { ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_TAG')); }
                }
                else
                {
                    // Grab Poll Choices & make into an unordered list with Markdown
                    let pollChoices = [];
                    for (const PollAnswer of RepliedMessage.poll.answers)
                    {
                        pollChoices.push(`- ${PollAnswer[1].emoji != null ? `${PollAnswer[1].emoji.toString()} ` : ''}${PollAnswer[1].text != null ? PollAnswer[1].text : ''}`);
                    }

                    crosspostMessage = `__**${RepliedMessage.poll.question.text}**__\n\n${pollChoices.join(`\n`)}`;
                    ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_POLL_TAG'));
                }

                // Throw Button into Action Row so it's sendable
                const ActionRowMessageLink = new ActionRowBuilder().addComponents(ButtonMessageLink);


                // Cross-post Message to Home Channel
                await HomeWebhook.send({
                    username: (RepliedMessage.member?.displayName || RepliedMessage.author.displayName),
                    avatarURL: (RepliedMessage.member?.avatarURL({ extension: 'png' }) || RepliedMessage.author.avatarURL({ extension: 'png' })),
                    //embeds: RepliedMessage.embeds.length > 0 ? RepliedMessage.embeds : undefined, // Link embeds break with this lol
                    files: originalAttachments.length > 0 ? originalAttachments : undefined,
                    allowedMentions: { parse: [] },
                    content: crosspostMessage,
                    components: [ActionRowMessageLink],
                    flags: RepliedMessage.flags.has(MessageFlags.SuppressEmbeds) ? MessageFlags.SuppressEmbeds : undefined
                })
                .then(async sentMessage => {

                    // Add to DB
                    await FeaturedMessage.create({
                        guildId: message.guildId,
                        originalMessageId: RepliedMessage.id,
                        featuredMessageId: sentMessage.id,
                        featureType: "HIGHLIGHT",
                        featureUntil: (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateIsoTimeUntil('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateIsoTimeUntil('FIVE_DAYS') : calculateIsoTimeUntil('THREE_DAYS')
                    })
                    .then(async (newDocument) => {
                        await newDocument.save()
                        .then(async () => {
                        
                            // Store callback to remove featured Message from Home Channel after duration (just in case)
                            await TimerModel.create({
                                timerExpires: (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateUnixTimeUntil('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateUnixTimeUntil('FIVE_DAYS') : calculateUnixTimeUntil('THREE_DAYS'),
                                callback: expireMessage.toString(),
                                guildId: message.guildId,
                                originalMessageId: RepliedMessage.id,
                                featuredMessageId: sentMessage.id,
                                channelId: message.channelId,
                                guildLocale: message.guild.preferredLocale
                            })
                            .then(async newDocument => { await newDocument.save(); })
                            .catch(async err => { await LogError(err); });
                        
                            // Call method to update Home Channel's headers
                            //   (adding a .length check to reduce spam-editing the message with the exact same content, while Voice & Stage stuff is WIP)
                            if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 1 ) { await refreshMessagesAudio(message.guildId, message.guild.preferredLocale); }
                        
                            // Timeout for auto-removing the Message
                            setTimeout(async () => { await expireMessage(message.guildId, RepliedMessage.id, message.guild.preferredLocale) }, (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateTimeoutDuration('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateTimeoutDuration('FIVE_DAYS') : calculateTimeoutDuration('THREE_DAYS'));
                            
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
        // Ensure we have full(ish) Message object
        let message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        // Ignore Bots, System Messages, and other disallowed Message types
        if ( message.author.bot ) { return; }
        if ( message.system || message.author.system ) { return; }
        if ( DisallowedMessageTypes.includes(message.type) ) { return; }

        // Safe-guard against Discord outages
        if ( !message.guild.available ) { return; }

        // Ensure Message is not too old
        if ( (Date.now() - message.createdAt.getTime()) > 6.048e+8 ) { return; }

        // Grab Author of Message
        let messageAuthor = message.member == null ? await message.guild.members.fetch(message.author.id) : message.member.partial ? await message.member.fetch() : message.member;


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
        let messageMemberRoles = messageAuthor.roles?.cache;
        let roleFilterArray = [];
        messageMemberRoles.forEach(role => {
            // Filter out atEveryone
            if ( role.id !== message.guildId ) { roleFilterArray.push({ blockedId: role.id }); }
        });

        // Don't do the Role Block List check if the Member doesn't have any Roles (excluding atEveryone)
        if ( roleFilterArray.length > 0 )
        {
            if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: roleFilterArray }) != null ) { return; }
        }


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


            // Create cooldown to prevent highlighting for about an hour, to reduce chances of being spammed
            if ( !MessageCooldown.has(message.id) )
            {
                MessageCooldown.set(message.id, { thresholdMet: false });
                setTimeout(() => { MessageCooldown.delete(message.id); }, 3.6e+6);
            }

            return;
        }
        else
        {
            // Message IS in cache, add one to reactionCount and check if met Activity Threshold
            messageCache.reactionCount += 1;

            let guildConfig = await GuildConfig.findOne({ guildId: message.guildId });

            // Total of both Replies and Reactions
            let totalActivityCount = messageCache.replyCount + messageCache.reactionCount;
            let totalThreshold = Math.ceil((replyThreshold[guildConfig.messageActivity] + reactionThreshold[guildConfig.messageActivity]) / 2);

            // Fetch which Activity Threshold Server uses
            /** @type {Number} */
            let setReplyThreshold = replyThreshold[guildConfig.messageActivity];
            /** @type {Number} */
            let setReactionThreshold = reactionThreshold[guildConfig.messageActivity];

            
            // Check Threshold!
            if ( messageCache.replyCount >= setReplyThreshold || messageCache.reactionCount >= setReactionThreshold || totalActivityCount >= totalThreshold )
            {
                
                // ******* Threshold met

                // If anti-spam cooldown is active, hold off
                let fetchedMessageCooldown = MessageCooldown.get(message.id)
                if ( fetchedMessageCooldown != undefined )
                {
                    if ( fetchedMessageCooldown.thresholdMet === true ) { return; }
                    else
                    {
                        fetchedMessageCooldown.thresholdMet = true;
                        MessageCooldown.set(message.id, fetchedMessageCooldown);
                    }
                }

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


                // If attachments in original messages, do thing
                let originalAttachments = [];
                let containsUnsupportedAttachments = false;

                if ( message.attachments.size > 0 && message.poll == null ) {
                    message.attachments.forEach(attachment => {
                        if ( !AllowedContentTypes.includes(attachment.contentType) ) { containsUnsupportedAttachments = true; }
                        else if ( attachment.spoiler === true ) { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setSpoiler(attachment.spoiler).setName(attachment.name) ); }
                        else { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setName(attachment.name) ); }
                    });
                }


                // Message content to cross-post (changes depending on if it is a Poll or not, and if it is Highlighted or Featured)
                //   Include a Link Button to link back to the source Message
                let crosspostMessage = "";

                const ButtonMessageLink = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(message.url);
                
                if ( message.poll == null )
                {
                    // Use CDN link for first Attachment if no content is included but there is an Attachment
                    crosspostMessage = `${message.content.length > 0 ?
                        `${message.content.length > 1990 ? `${message.content.slice(0, 1991)}...` : message.content}`
                        : containsUnsupportedAttachments ? `${message.attachments.first()?.url}` : ''}`;

                    // Button Label depends on Attachments (if any)
                    if ( message.content !== '' && originalAttachments.length === 0 && containsUnsupportedAttachments ) { ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_AND_ATTACHMENT_TAG')); }
                    else { ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_MESSAGE_TAG')); }
                }
                else
                {
                    // Grab Poll Choices & make into an unordered list with Markdown
                    let pollChoices = [];
                    for (const PollAnswer of message.poll.answers)
                    {
                        pollChoices.push(`- ${PollAnswer[1].emoji != null ? `${PollAnswer[1].emoji.toString()} ` : ''}${PollAnswer[1].text != null ? PollAnswer[1].text : ''}`);
                    }

                    crosspostMessage = `__**${message.poll.question.text}**__\n\n${pollChoices.join(`\n`)}`;
                    ButtonMessageLink.setLabel(localize(message.guild.preferredLocale, 'HOME_ORIGINAL_POLL_TAG'));
                }

                // Throw Button into Action Row so it's sendable
                const ActionRowMessageLink = new ActionRowBuilder().addComponents(ButtonMessageLink);


                // Cross-post Message to Home Channel
                await HomeWebhook.send({
                    username: (messageAuthor?.displayName || messageAuthor.user.displayName),
                    avatarURL: (messageAuthor?.displayAvatarURL({ extension: 'png' }) || messageAuthor.user.displayAvatarURL({ extension: 'png' })),
                    //embeds: message.embeds.length > 0 ? message.embeds : undefined, // Link embeds broke
                    files: originalAttachments.length > 0 ? originalAttachments : undefined,
                    allowedMentions: { parse: [] },
                    content: crosspostMessage,
                    components: [ActionRowMessageLink],
                    flags: message.flags.has(MessageFlags.SuppressEmbeds) ? MessageFlags.SuppressEmbeds : undefined
                })
                .then(async sentMessage => {

                    // Add to DB
                    await FeaturedMessage.create({
                        guildId: message.guildId,
                        originalMessageId: message.id,
                        featuredMessageId: sentMessage.id,
                        featureType: "HIGHLIGHT",
                        featureUntil: (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateIsoTimeUntil('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateIsoTimeUntil('FIVE_DAYS') : calculateIsoTimeUntil('THREE_DAYS')
                    })
                    .then(async (newDocument) => {
                        await newDocument.save()
                        .then(async () => {
                        
                            // Store callback to remove featured Message from Home Channel after duration (just in case)
                            await TimerModel.create({
                                timerExpires: (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateUnixTimeUntil('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateUnixTimeUntil('FIVE_DAYS') : calculateUnixTimeUntil('THREE_DAYS'),
                                callback: expireMessage.toString(),
                                guildId: message.guildId,
                                originalMessageId: message.id,
                                featuredMessageId: sentMessage.id,
                                channelId: message.channelId,
                                guildLocale: message.guild.preferredLocale
                            })
                            .then(async newDocument => { await newDocument.save(); })
                            .catch(async err => { await LogError(err); });
                        
                            // Call method to update Home Channel's headers
                            //   (adding a .length check to reduce spam-editing the message with the exact same content, while Voice & Stage stuff is WIP)
                            if ( (await FeaturedMessage.find({ guildId: message.guildId })).length === 1 ) { await refreshMessagesAudio(message.guildId, message.guild.preferredLocale); }
                        
                            // Timeout for auto-removing the Message
                            setTimeout(async () => { await expireMessage(message.guildId, message.id, message.guild.preferredLocale) }, (guildConfig.messageActivity === 'VERY_LOW' || guildConfig.messageActivity === 'LOW') ? calculateTimeoutDuration('SEVEN_DAYS') : guildConfig.messageActivity === 'MEDIUM' ? calculateTimeoutDuration('FIVE_DAYS') : calculateTimeoutDuration('THREE_DAYS'));
                            
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
                // ******* Threshold not met

                // Save to cache
                MessageActivityCache.set(message.id, messageCache);

                return;
            }
        }
    },





    /**
     * Processes Messages that are in public Threads, for highlighting Threads!
     * @param {Message} message 
     */
    async processMessageInThread(message)
    {
        // Check Channel/Category Block List
        let blockListFilter = [ { blockedId: message.channelId } ];
        if ( message.channel.parentId != null ) { blockListFilter.push({ blockedId: message.channel.parentId }); }
        if ( message.channel.parent?.parentId != null ) { blockListFilter.push({ blockedId: message.channel.parent.parentId }); }
        if ( await GuildBlocklist.exists({ guildId: message.guildId, $or: blockListFilter }) != null ) { return; }

        // Check if max featured Threads has been reached
        if ( (await FeaturedThread.find({ guildId: message.guildId })).length === 5 ) { return; }

        // Check if Thread is already featured
        if ( await FeaturedThread.exists({ guildId: message.guildId, threadId: message.channelId }) != null ) { return; }


        // Check if Thread is in cache
        let threadCache = ThreadActivityCache.get(message.channelId);
        if ( !threadCache )
        {
            // Thread is NOT in cache, create object to add to cache
            threadCache = { threadId: message.channelId, messageCount: 1 };

            // Save to cache
            ThreadActivityCache.set(message.channelId, threadCache);

            // Create timeout to delete after 3 days
            setTimeout(() => { ThreadActivityCache.delete(message.channelId) }, 2.592e+8);

            return;
        }
        else
        {
            // Thread IS in cache, add one to count and check if met Activity Threshold
            threadCache.messageCount += 1;

            let guildConfig = await GuildConfig.findOne({ guildId: message.guildId });

            // Fetch Activity Threshold Server uses
            /** @type {Number} */
            let setThreadThreshold = threadThreshold[guildConfig.threadActivity];


            // Check Threshold
            if ( threadCache.messageCount >= setThreadThreshold )
            {
                // Threshold met - Highlight Thread!
                
                // Add to DB
                await FeaturedThread.create({
                    guildId: message.guildId,
                    threadId: message.channelId,
                    threadType: message.channel.parent?.type === ChannelType.GuildForum ? "POST" : message.channel.parent?.type === ChannelType.GuildMedia ? "POST" : "THREAD",
                    featureType: "HIGHLIGHT",
                    featureUntil: (guildConfig.threadActivity === 'VERY_LOW' || guildConfig.threadActivity === 'LOW') ? calculateIsoTimeUntil('SEVEN_DAYS') : guildConfig.threadActivity === 'MEDIUM' ? calculateIsoTimeUntil('FIVE_DAYS') : calculateIsoTimeUntil('THREE_DAYS')
                })
                .then(async (newDocument) => {
                    await newDocument.save()
                    .then(async () => {
                        // Store callback to remove featured Thread from Home Channel after duration (just in case)
                        await TimerModel.create({
                            timerExpires: (guildConfig.threadActivity === 'VERY_LOW' || guildConfig.threadActivity === 'LOW') ? calculateUnixTimeUntil('SEVEN_DAYS') : guildConfig.threadActivity === 'MEDIUM' ? calculateUnixTimeUntil('FIVE_DAYS') : calculateUnixTimeUntil('THREE_DAYS'),
                            callback: expireThread.toString(),
                            guildId: message.guildId,
                            threadId: message.channelId,
                            guildLocale: message.guild.preferredLocale
                        })
                        .then(async newDocument => { await newDocument.save(); })
                        .catch(async err => { await LogError(err); });
                    
                        // Call method to update Home Channel
                        await refreshEventsThreads(message.guildId, message.guild.preferredLocale);
                    
                        // Timeout for auto-removing the Thread
                        setTimeout(async () => { await expireThread(message.guildId, message.channelId, message.guild.preferredLocale) }, (guildConfig.threadActivity === 'VERY_LOW' || guildConfig.threadActivity === 'LOW') ? calculateTimeoutDuration('SEVEN_DAYS') : guildConfig.threadActivity === 'MEDIUM' ? calculateTimeoutDuration('FIVE_DAYS') : calculateTimeoutDuration('THREE_DAYS'));
                        
                        ThreadActivityCache.delete(message.channelId); // Delete from cache now that its highlighted
                        
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

                return;
            }
            else
            {
                // Threshold not met
                // Save to cache
                ThreadActivityCache.set(message.channelId, threadCache);

                return;
            }
        }
    }

}
