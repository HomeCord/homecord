const { StringSelectMenuInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, ChannelType, OverwriteType } = require("discord.js");
const { DiscordClient, Collections, fetchDisplayName } = require("../../../constants.js");
const { localize } = require("../../../BotModules/LocalizationModule.js");
const { GuildConfig } = require("../../../Mongoose/Models.js");
const { LogError } = require("../../../BotModules/LoggingModule.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-finalize",

    // Select's Description
    Description: `Handles Setup Step 2 stuff`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {StringSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        // Grab option selected
        const SelectedOption = interaction.values.pop();
        // Split up Custom ID
        const SettingValueKeys = interaction.customId.split("_");
        SettingValueKeys.shift(); // Remove Custom ID itself

        // Act depending on which option was selected
        switch (SelectedOption)
        {
            case 'REVALIDATE':
                await revalidateHome(interaction, SettingValueKeys);
                break;


            case 'CONFIRM':
                if ( SettingValueKeys[0] === 'c' ) { await setupNewChannel(interaction, SettingValueKeys); }
                else { await setupExistingChannel(interaction, SettingValueKeys); }
                break;


            case 'CANCEL':
                await interaction.update({ content: localize(interaction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                break;
        }

        return;
    }
}








/**
 * Completes the Setup (for when "Create for me" option is selected)
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {String[]} settingValues 
 */
async function setupNewChannel(interaction, settingValues)
{
    // Update to a "processing" state, just in case
    let processingEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETUP_PAGE_3_TITLE'))
    .setDescription(localize(interaction.locale, 'SETUP_PAGE_3_DESCRIPTION'))
    .setFooter({ text: localize(interaction.locale, 'SETUP_EMBED_FOOTER_STEP_THREE') });

    await interaction.update({ content: null, embeds: [processingEmbed], components: [] });



    // Create Channel
    await interaction.guild.channels.create({
        name: localize(interaction.guildLocale, 'HOME_CHANNEL_NAME'),
        type: ChannelType.GuildText,
        topic: localize(interaction.guildLocale, 'HOME_CHANNEL_DESCRIPTION'),
        permissionOverwrites: [
            { id: interaction.guildId, deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads, PermissionFlagsBits.AddReactions, PermissionFlagsBits.UseEmbeddedActivities], allow: PermissionFlagsBits.UseExternalEmojis, type: OverwriteType.Role }, // for atEveryone
            { id: DiscordClient.user.id, allow: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageWebhooks], type: OverwriteType.Member } // for HomeCord
        ],
        reason: localize(interaction.guildLocale, 'HOMECORD_CHANNEL_CREATION_REASON', fetchDisplayName(interaction.user, true))
    })
    .then(async createdChannel => {

        // ******* Attempt to create Webhook in Channel
        await createdChannel.createWebhook({
            name: localize(interaction.guildLocale, 'HOMECORD_WEBHOOK_NAME'),
            avatar: "https://us-east-1.tixte.net/uploads/zebby.is-from.space/homecord-icon.png",
            reason: localize(interaction.guildLocale, 'HOMECORD_WEBHOOK_CREATION_REASON', `${fetchDisplayName(interaction.user, true)}`)
        })
        .then(async createdWebhook => {

            // Create the main Message
            await createdWebhook.send({ allowedMentions: { parse: [] }, content: `${localize(interaction.guildLocale, 'HOME_TITLE', interaction.guild.name)}\n${localize(interaction.guildLocale, 'HOME_SUBHEADING')}` })
            .then(async headerMessage => {

                // Create Message for Events & Threads
                await createdWebhook.send({ allowedMentions: { parse: [] }, content: `\u200B` })
                .then(async eventThreadMessage => {

                    // Create Message for Stages & Voice
                    await createdWebhook.send({ allowedMentions: { parse: [] }, content: `\u200B` })
                    .then(async audioMessage => {

                        // Add to Database!
                        let checkConfig = await GuildConfig.exists({ guildId: interaction.guildId });
                        let fetchedConfig = null;

                        if ( checkConfig != null ) { fetchedConfig = await GuildConfig.findOne({ guildId: interaction.guildId }); fetchedConfig.isNew = false; }
                        // Only adding in these values here to make it shut up about "You didn't pass required arguments" YES I AM WHAT ARE YOU ON ABOUT DO YOU NOT SEE THE VALUES BEING SET BEFORE I RUN .save()?!
                        else { fetchedConfig = await GuildConfig.create({ guildId: interaction.guildId, homeChannelId: createdChannel.id, homeWebhookId: createdWebhook.id, headerMessageId: headerMessage.id, eventThreadsMessageId: eventThreadMessage.id, audioMessageId: audioMessage.id }); }

                        fetchedConfig.homeChannelId = createdChannel.id;
                        fetchedConfig.homeWebhookId = createdWebhook.id;
                        fetchedConfig.headerMessageId = headerMessage.id;
                        fetchedConfig.eventThreadsMessageId = eventThreadMessage.id;
                        fetchedConfig.audioMessageId = audioMessage.id;
                        fetchedConfig.messageActivity = settingValues[1] === "vh" ? "VERY_HIGH" : settingValues[1] === "h" ? "HIGH" : settingValues[1] === "m" ? "MEDIUM" : settingValues[1] === "l" ? "LOW" : settingValues[1] === "vl" ? "VERY_LOW" : "DISABLED";
                        fetchedConfig.eventActivity = settingValues[2] === "vh" ? "VERY_HIGH" : settingValues[2] === "h" ? "HIGH" : settingValues[2] === "m" ? "MEDIUM" : settingValues[2] === "l" ? "LOW" : settingValues[2] === "vl" ? "VERY_LOW" : "DISABLED";
                        fetchedConfig.voiceActivity = settingValues[3] === "vh" ? "VERY_HIGH" : settingValues[3] === "h" ? "HIGH" : settingValues[3] === "m" ? "MEDIUM" : settingValues[3] === "l" ? "LOW" : settingValues[3] === "vl" ? "VERY_LOW" : "DISABLED";
                        fetchedConfig.stageActivity = settingValues[4] === "vh" ? "VERY_HIGH" : settingValues[4] === "h" ? "HIGH" : settingValues[4] === "m" ? "MEDIUM" : settingValues[4] === "l" ? "LOW" : settingValues[4] === "vl" ? "VERY_LOW" : "DISABLED";
                        fetchedConfig.threadActivity = settingValues[5] === "vh" ? "VERY_HIGH" : settingValues[5] === "h" ? "HIGH" : settingValues[5] === "m" ? "MEDIUM" : settingValues[5] === "l" ? "LOW" : settingValues[5] === "vl" ? "VERY_LOW" : "DISABLED";

                        await fetchedConfig.save()
                        .then(async () => {
                        
                            await interaction.editReply({ content: localize(interaction.locale, 'SETUP_CREATION_SUCCESSFUL', `<#${createdChannel.id}>`), embeds: [], components: [] });
                            return;
                        })
                        .catch(async err => {
                        
                            await LogError(err);
                            await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                            return;
                        });
                    })
                    .catch(async err => {

                        await LogError(err);
                        await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                        return;
                    });
                })
                .catch(async err => {

                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                    return;
                });

            })
            .catch(async err => {

                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                return;
            });
        })
        .catch(async err => {

            await LogError(err);
            await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
            return;
        });
    })
    .catch(async err => {

        await LogError(err);
        await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
        return;
    });
    
    

    return;
}








/**
 * Completes the Setup (for when an existing Channel is selected)
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {String[]} settingValues 
 */
async function setupExistingChannel(interaction, settingValues)
{
    // Update to a "processing" state, just in case
    let processingEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETUP_PAGE_3_TITLE'))
    .setDescription(localize(interaction.locale, 'SETUP_PAGE_3_DESCRIPTION'))
    .setFooter({ text: localize(interaction.locale, 'SETUP_EMBED_FOOTER_STEP_THREE') });

    await interaction.update({ content: null, embeds: [processingEmbed], components: [] });



    // Fetch Channel
    /** @type {TextChannel} */
    let fetchedChannel = await interaction.guild.channels.fetch(settingValues[0]);
    
    // ******* Attempt to create Webhook in Channel
    await fetchedChannel.createWebhook({
        name: localize(interaction.guildLocale, 'HOMECORD_WEBHOOK_NAME'),
        avatar: "https://us-east-1.tixte.net/uploads/zebby.is-from.space/homecord-icon.png",
        reason: localize(interaction.guildLocale, 'HOMECORD_WEBHOOK_CREATION_REASON', `${fetchDisplayName(interaction.user, true)}`)
    })
    .then(async createdWebhook => {

        // Create the header Message
        await createdWebhook.send({ allowedMentions: { parse: [] }, content: `${localize(interaction.guildLocale, 'HOME_TITLE', interaction.guild.name)}\n${interaction.guild.description != null ? `\`\`\`${interaction.guild.description}\`\`\`\n\n${localize(interaction.guildLocale, 'HOME_SUBHEADING')}` : localize(interaction.guildLocale, 'HOME_SUBHEADING')}` })
        .then(async headerMessage => {

            // Create Message for Events & Threads
            await createdWebhook.send({ allowedMentions: { parse: [] }, content: `\u200B` })
            .then(async eventThreadMessage => {

                // Create Message for Stages & Voice
                await createdWebhook.send({ allowedMentions: { parse: [] }, content: `\u200B` })
                .then(async audioMessage => {

                    // Add to Database!
                    let checkConfig = await GuildConfig.exists({ guildId: interaction.guildId });
                    let fetchedConfig = null;

                    if ( checkConfig != null ) { fetchedConfig = await GuildConfig.findOne({ guildId: interaction.guildId }); fetchedConfig.isNew = false; }
                    // Only adding in these values here to make it shut up about "You didn't pass required arguments" YES I AM WHAT ARE YOU ON ABOUT DO YOU NOT SEE THE VALUES BEING SET BEFORE I RUN .save()?!
                    else { fetchedConfig = await GuildConfig.create({ guildId: interaction.guildId, homeChannelId: fetchedChannel.id, homeWebhookId: createdWebhook.id, headerMessageId: headerMessage.id, eventThreadsMessageId: eventThreadMessage.id, audioMessageId: audioMessage.id }); }

                    fetchedConfig.homeChannelId = fetchedChannel.id;
                    fetchedConfig.homeWebhookId = createdWebhook.id;
                    fetchedConfig.headerMessageId = headerMessage.id;
                    fetchedConfig.eventThreadsMessageId = eventThreadMessage.id;
                    fetchedConfig.audioMessageId = audioMessage.id;
                    fetchedConfig.messageActivity = settingValues[1] === "vh" ? "VERY_HIGH" : settingValues[1] === "h" ? "HIGH" : settingValues[1] === "m" ? "MEDIUM" : settingValues[1] === "l" ? "LOW" : settingValues[1] === "vl" ? "VERY_LOW" : "DISABLED";
                    fetchedConfig.eventActivity = settingValues[2] === "vh" ? "VERY_HIGH" : settingValues[2] === "h" ? "HIGH" : settingValues[2] === "m" ? "MEDIUM" : settingValues[2] === "l" ? "LOW" : settingValues[2] === "vl" ? "VERY_LOW" : "DISABLED";
                    fetchedConfig.voiceActivity = settingValues[3] === "vh" ? "VERY_HIGH" : settingValues[3] === "h" ? "HIGH" : settingValues[3] === "m" ? "MEDIUM" : settingValues[3] === "l" ? "LOW" : settingValues[3] === "vl" ? "VERY_LOW" : "DISABLED";
                    fetchedConfig.stageActivity = settingValues[4] === "vh" ? "VERY_HIGH" : settingValues[4] === "h" ? "HIGH" : settingValues[4] === "m" ? "MEDIUM" : settingValues[4] === "l" ? "LOW" : settingValues[4] === "vl" ? "VERY_LOW" : "DISABLED";
                    fetchedConfig.threadActivity = settingValues[5] === "vh" ? "VERY_HIGH" : settingValues[5] === "h" ? "HIGH" : settingValues[5] === "m" ? "MEDIUM" : settingValues[5] === "l" ? "LOW" : settingValues[5] === "vl" ? "VERY_LOW" : "DISABLED";

                    await fetchedConfig.save()
                    .then(async () => {
                    
                        await interaction.editReply({ content: localize(interaction.locale, 'SETUP_CREATION_SUCCESSFUL', `<#${fetchedChannel.id}>`), embeds: [], components: [] });
                        return;
                    })
                    .catch(async err => {
                    
                        await LogError(err);
                        await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                        return;
                    });
                })
                .catch(async err => {

                    await LogError(err);
                    await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                    return;
                });
            })
            .catch(async err => {

                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
                return;
            });
        })
        .catch(async err => {

            await LogError(err);
            await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
            return;
        });
    })
    .catch(async err => {

        await LogError(err);
        await interaction.editReply({ content: localize(interaction.locale, 'SETUP_SAVE_ERROR_GENERIC'), embeds: [], components: [] });
        return;
    });

    return;
}








/**
 * Revalidates Home Channel Setup Settings
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {String[]} settingValues 
 */
async function revalidateHome(interaction, settingValues)
{
    // Update to a "processing" state, just in case
    let processingEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETUP_PAGE_2_TITLE'))
    .setDescription(localize(interaction.locale, 'SETUP_PAGE_2_PROCESSING_DESCRIPTION'))
    .setFooter({ text: localize(interaction.locale, 'SETUP_EMBED_FOOTER_STEP_TWO') });

    await interaction.update({ content: null, embeds: [processingEmbed], components: [] });



    // ******* CHECK PERMISSIONS
    let validationEmbed = new EmbedBuilder().setColor('Grey')
    .setTitle(localize(interaction.locale, 'SETUP_PAGE_2_TITLE'))
    .setFooter({ text: localize(interaction.locale, 'SETUP_EMBED_FOOTER_STEP_TWO') });

    let requiredString = "";
    let suggestionString = "";
    let passRequirements = true;


    // For checks specific to creating Home Channel for User
    if ( settingValues[0] === 'c' )
    {
        // Manage Channels
        if ( !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) ) { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_CHANNELS_PERMISSION_MISSING')}`; passRequirements = false; }
        else { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_CHANNELS_PERMISSION_SUCCESS')}`; }

        // Manage Webhooks
        if ( !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks) ) { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_WEBHOOKS_PERMISSION_MISSING')}`; passRequirements = false; }
        else { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_WEBHOOKS_PERMISSION_SUCCESS')}`; }

        // Set Embed Description
        validationEmbed.setDescription(localize(interaction.locale, 'SETUP_VALIDATION_SERVER_BASED'))
        .addFields(
            { name: localize(interaction.locale, 'SETUP_VALIDATION_REQUIREMENTS'), value: `${localize(interaction.locale, 'SETUP_VALIDATION_REQUIREMENTS_DESCRIPTION')}\n\n${requiredString}` }
        );
    }
    // For checks specific to using an existing Home Channel
    else
    {
        // Fetch Channel
        /** @type {TextChannel} */
        let fetchedChannel = await interaction.guild.channels.fetch(settingValues[0]);

        // Manage Webhooks
        if ( !interaction.guild.members.me.permissionsIn(settingValues[0]).has(PermissionFlagsBits.ManageWebhooks) ) { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_WEBHOOKS_PERMISSION_MISSING')}`; passRequirements = false; }
        else { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_MANAGE_WEBHOOKS_PERMISSION_SUCCESS')}`; }

        // Send Messages (for atEveryone)
        if ( fetchedChannel.permissionsFor(interaction.guildId).has(PermissionFlagsBits.SendMessages) ) { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_SEND_MESSAGES_REVOKE_FAILED')}`; passRequirements = false; }
        else { requiredString += `${requiredString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_SEND_MESSAGES_REVOKE_SUCCESS')}`; }

        // Embed Links
        if ( !interaction.guild.members.me.permissionsIn(settingValues[0]).has(PermissionFlagsBits.EmbedLinks) ) { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_EMBED_LINKS_PERMISSION_MISSING')}`; }
        else { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_EMBED_LINKS_PERMISSION_SUCCESS')}`; }

        // Attach Files
        if ( !interaction.guild.members.me.permissionsIn(settingValues[0]).has(PermissionFlagsBits.AttachFiles) ) { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_ATTACH_FILES_PERMISSION_MISSING')}`; }
        else { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_ATTACH_FILES_PERMISSION_SUCCESS')}`; }

        // Use External Emojis
        if ( !fetchedChannel.permissionsFor(interaction.guildId).has(PermissionFlagsBits.UseExternalEmojis) ) { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_EXTERNAL_EMOJIS_PERMISSION_MISSING')}`; }
        else { suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_EXTERNAL_EMOJIS_PERMISSION_SUCCESS')}`; }

        // Channel Position
        suggestionString += `${suggestionString.length > 3 ? `\n` : ''}- ${localize(interaction.locale, 'SETUP_CHANNEL_POSITION', `<#${fetchedChannel.id}>`)}`;

        // Set Embed Description & fields
        validationEmbed.setDescription(localize(interaction.locale, 'SETUP_VALIDATION_CHANNEL_BASED', `<#${settingValues[0]}>`))
        .addFields(
            { name: localize(interaction.locale, 'SETUP_VALIDATION_REQUIREMENTS'), value: `${localize(interaction.locale, 'SETUP_VALIDATION_REQUIREMENTS_DESCRIPTION')}\n\n${requiredString}` },
            { name: localize(interaction.locale, 'SETUP_VALIDATION_SUGGESTIONS'), value: `${localize(interaction.locale, 'SETUP_VALIDATION_SUGGESTIONS_DESCRIPTION')}\n\n${suggestionString}` }
        );
    }


    // Create Selects
    let validationRevalidateSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId(`setup-finalize_${settingValues.join("_")}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
            new StringSelectMenuOptionBuilder().setValue('REVALIDATE').setLabel(localize(interaction.locale, 'SETUP_STEP_2_SELECT_RECHECK')).setDescription(localize(interaction.locale, 'SETUP_STEP_2_SELECT_RECHECK_DESCRIPTION')).setEmoji(`⚙`),
            new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(interaction.locale, 'SETUP_SELECT_CANCEL')).setEmoji(`❌`)
        )
    );
    let validationFullSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId(`setup-finalize_${settingValues.join("_")}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
            new StringSelectMenuOptionBuilder().setValue('REVALIDATE').setLabel(localize(interaction.locale, 'SETUP_STEP_2_SELECT_RECHECK')).setDescription(localize(interaction.locale, 'SETUP_STEP_2_SELECT_RECHECK_DESCRIPTION')).setEmoji(`⚙`),
            new StringSelectMenuOptionBuilder().setValue('CONFIRM').setLabel(localize(interaction.locale, 'SETUP_STEP_2_SELECT_CONFIRM')).setDescription(localize(interaction.locale, 'SETUP_STEP_2_SELECT_CONFIRM_DESCRIPTION')).setEmoji(`✅`),
            new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(interaction.locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(interaction.locale, 'SETUP_SELECT_CANCEL')).setEmoji(`❌`)
        )
    );

    // ACK
    if ( passRequirements === false ) { await interaction.editReply({ content: null, embeds: [validationEmbed], components: [validationRevalidateSelect] }); }
    else { await interaction.editReply({ content: null, embeds: [validationEmbed], components: [validationFullSelect] }); }

    return;
}
