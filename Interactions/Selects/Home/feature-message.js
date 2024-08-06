const { StringSelectMenuInteraction, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");
const { GuildConfig, TimerModel, FeaturedMessage } = require("../../../Mongoose/Models");
const { DiscordClient } = require("../../../constants");
const { LogError } = require("../../../BotModules/LoggingModule");
const { calculateUnixTimeUntil, calculateTimeoutDuration, calculateIsoTimeUntil } = require("../../../BotModules/UtilityModule");
const { refreshMessagesAudio } = require("../../../BotModules/HomeModule");
const { resetHomeSliently } = require("../../../BotModules/ResetHomeModule");
const { expireMessage } = require("../../../BotModules/ExpiryModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "feature-message",

    // Select's Description
    Description: `Handles featuring a Message to a Home Channel`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 15,



    /**
     * Executes the Select
     * @param {StringSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        // Just in case - also hides the select to prevent spammage
        await interaction.update({ components: [], content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_PROCESSING') });

        // Grab Original Message & Select Input
        const OriginalMessageId = interaction.customId.split("_").pop();
        const OriginalMessage = await interaction.channel.messages.fetch(OriginalMessageId);
        const InputDuration = interaction.values.shift();

        // Fetch Home Channel's Webhook
        const ServerConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
        let HomeWebhook;
        try { HomeWebhook = await DiscordClient.fetchWebhook(ServerConfig.homeWebhookId); }
        catch (err) {
            await LogError(err);
            if ( err.name.includes("10015") || err.name.toLowerCase().includes("unknown webhook") )
            { 
                await resetHomeSliently(interaction.guildId);
                await interaction.editReply({ content: localize(interaction.locale, 'ERROR_WEBHOOK_MISSING') });
                return;
            }
            else
            {
                await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_GENERIC', OriginalMessage.url) });
                return;
            }
        }


        // If attachments in original messages, do thing
        let originalAttachments = [];
        if ( OriginalMessage.attachments.size > 0 && OriginalMessage.poll == null ) {
            OriginalMessage.attachments.forEach(attachment => {
                if ( attachment.spoiler === true ) { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setSpoiler(attachment.spoiler).setName(attachment.name) ); }
                else { originalAttachments.push( new AttachmentBuilder().setFile(attachment.url, attachment.name).setName(attachment.name) ); }
            });
        }


        // Message content to cross-post (changes depending on if it is a Poll or not, and if it is Highlighted or Featured)
        //   Include a Link Button to link back to source Message
        let crosspostMessage = "";

        const ButtonMessageLink = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(OriginalMessage.url).setEmoji(`<:blurpleSparkles:1204729760689954826>`);
                
        if ( OriginalMessage.poll == null )
        {
            crosspostMessage = `${OriginalMessage.content.length > 0 ? `${OriginalMessage.content.length > 1990 ? `${OriginalMessage.content.slice(0, 1991)}...` : OriginalMessage.content}` : ''}`;
            ButtonMessageLink.setLabel(localize(OriginalMessage.guild.preferredLocale, 'HOME_FEATURED_MESSAGE_TAG'));
        }
        else
        {
            // Grab Poll Choices & make into an unordered list with Markdown
            let pollChoices = [];
            for ( const PollAnswer of OriginalMessage.poll.answers )
            {
                pollChoices.push(`- ${PollAnswer[1].emoji != null ? `${PollAnswer[1].emoji.toString()} ` : ''}${PollAnswer[1].text != null ? PollAnswer[1].text : ''}`);
            }

            crosspostMessage = `__**${OriginalMessage.poll.question.text}**__\n\n${pollChoices.join(`\n`)}`;
            ButtonMessageLink.setLabel(localize(OriginalMessage.guild.preferredLocale, 'HOME_FEATURED_POLL_TAG'));
        }

        // Throw Button into Action Row so it's sendable
        const ActionRowMessageLink = new ActionRowBuilder().addComponents(ButtonMessageLink);


        // Cross-post Message to Home Channel now that it's being featured
        await HomeWebhook.send({
            username: (OriginalMessage.member?.displayName || OriginalMessage.author.displayName),
            avatarURL: (OriginalMessage.member?.avatarURL({ extension: 'png' }) || OriginalMessage.author.avatarURL({ extension: 'png' })),
            //embeds: OriginalMessage.embeds.length > 0 ? OriginalMessage.embeds : undefined, // Link embeds broke with this. Whoops
            files: originalAttachments.length > 0 ? originalAttachments : undefined,
            allowedMentions: { parse: [] },
            content: crosspostMessage,
            components: [ActionRowMessageLink],
            flags: OriginalMessage.flags.has(MessageFlags.SuppressEmbeds) ? MessageFlags.SuppressEmbeds : undefined
        })
        .then(async sentMessage => {

            // Add to DB
            await FeaturedMessage.create({
                guildId: interaction.guildId,
                originalMessageId: OriginalMessageId,
                featuredMessageId: sentMessage.id,
                featureType: "FEATURE",
                featureUntil: calculateIsoTimeUntil(InputDuration)
            })
            .then(async (newDocument) => {
                await newDocument.save()
                .then(async () => {

                    // Store callback to remove featured Message from Home Channel after duration (just in case)
                    await TimerModel.create({ timerExpires: calculateUnixTimeUntil(InputDuration), callback: expireMessage.toString(), guildId: interaction.guildId, originalMessageId: OriginalMessageId, featuredMessageId: sentMessage.id, channelId: interaction.channelId, guildLocale: interaction.guildLocale })
                    .then(async newDocument => { await newDocument.save(); })
                    .catch(async err => { await LogError(err); });

                    // Call method to update Home Channel's headers
                    let refreshState = await refreshMessagesAudio(interaction.guildId, interaction.guildLocale);

                    // ACK User
                    if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_SUCCESS', OriginalMessage.url) }); } 
                    else { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_GENERIC', OriginalMessage.url) }); }

                    // Timeout for auto-removing the Message
                    setTimeout(async () => { await expireMessage(interaction.guildId, OriginalMessageId, interaction.guildLocale) }, calculateTimeoutDuration(InputDuration));
                    return;
                    
                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_GENERIC', OriginalMessage.url) });
                    return;
                });
                
            })
            .catch(async err => {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_GENERIC', OriginalMessage.url) });
                return;
            });

        })
        .catch(async err => {
            await LogError(err);
            await interaction.editReply({ content: localize(interaction.locale, 'ERROR_WITH_PREVIEW', `${err.name}: ${err.message}`) });
        });
    }
}
