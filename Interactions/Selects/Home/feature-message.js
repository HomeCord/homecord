const { StringSelectMenuInteraction } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");
const { GuildConfig, TimerModel, FeaturedMessage } = require("../../../Mongoose/Models");
const { DiscordClient } = require("../../../constants");
const { LogError } = require("../../../BotModules/LoggingModule");
const { calculateUnixTimeUntil, calculateTimeoutDuration, calculateIsoTimeUntil } = require("../../../BotModules/UtilityModule");
const { refreshMessagesAudio, expireMessage, resetHomeSliently } = require("../../../BotModules/HomeModule");

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


        // Cross-post Message to Home Channel now that it's being featured
        await HomeWebhook.send({
            username: (OriginalMessage.member?.displayName || OriginalMessage.author.displayName),
            avatarURL: (OriginalMessage.member?.avatarURL({ extension: 'png' }) || OriginalMessage.author.avatarURL({ extension: 'png' })),
            embeds: OriginalMessage.embeds.length > 0 ? OriginalMessage.embeds : undefined,
            files: OriginalMessage.attachments.size > 0 ? Array.from(OriginalMessage.attachments.entries()) : undefined,
            allowedMentions: { parse: [] },
            // Content is not just a straight copy-paste so that we can add "Featured Message" & Message URL to it
            content: `<:blurpleSparkles:1204729760689954826> **[${localize(interaction.guildLocale, 'HOME_FEATURED_MESSAGE_TAG')}](<${OriginalMessage.url}>)**${OriginalMessage.content.length > 0 ? `\n\n${OriginalMessage.content}` : ''}`
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
