const { StringSelectMenuInteraction, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, TextChannel } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { localize } = require("../../BotModules/LocalizationModule.js");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-home",

    // Select's Description
    Description: `Handles select options from /setup command`,

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
            // CHANNEL OPTION
            case 'CHANNEL':
                // Create Channel Select
                let channelSelect = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder().setCustomId(`setup-set-channel_${interaction.customId.slice(11)}`).setChannelTypes([ChannelType.GuildText]).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'SETUP_SET_CHANNEL_SELECT_PLACEHOLDER'))
                );
                // Create Buttons
                let channelButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`setup-create-channel_${interaction.customId.slice(11)}`).setStyle(ButtonStyle.Secondary).setLabel(localize(interaction.locale, 'SETUP_CREATE_CHANNEL_BUTTON_LABEL'))
                );
                // Create Embed
                let channelEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_SET_CHANNEL_EMBED_TITLE')).setDescription(localize(interaction.locale, 'SETUP_SET_CHANNEL_EMBED_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [channelEmbed], components: [channelSelect, channelButtons] });
                break;


            // ACTIVITY THRESHOLD OPTION
            case 'ACTIVITY_THRESHOLD':
                // Create Activity Select
                let activitySelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-activity_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`VERY_LOW`).setLabel(localize(interaction.locale, 'VERY_LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`LOW`).setLabel(localize(interaction.locale, 'LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`MEDIUM`).setLabel(localize(interaction.locale, 'MEDIUM')),
                        new StringSelectMenuOptionBuilder().setValue(`HIGH`).setLabel(localize(interaction.locale, 'HIGH')),
                        //new StringSelectMenuOptionBuilder().setValue(`VERY_HIGH`).setLabel(localize(interaction.locale, 'VERY_HIGH')) // Saving this option as a future premium option
                    )
                );
                // Create Embed
                let activityEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_SET_ACTIVITY_EMBED_TITLE')).setDescription(localize(interaction.locale, 'SETUP_SET_ACTIVITY_EMBED_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [activityEmbed], components: [activitySelect] });
                break;


            // HIGHLIGHT MESSAGES OPTION
            case 'HIGHLIGHT_MESSAGES':
                // Create Select
                let messageSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-message_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(interaction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(interaction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let messageEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_TITLE')).setDescription(localize(interaction.locale, 'SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [messageEmbed], components: [messageSelect] });
                break;


            // HIGHLIGHT EVENTS OPTION
            case 'HIGHLIGHT_EVENTS':
                // Create Select
                let eventSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-event_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(interaction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(interaction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let eventEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_TOGGLE_EVENT_HIGHLIGHTS_TITLE')).setDescription(localize(interaction.locale, 'SETUP_TOGGLE_EVENT_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [eventEmbed], components: [eventSelect] });
                break;


            // HIGHLIGHT VOICE OPTION
            case 'HIGHLIGHT_VOICE':
                // Create Select
                let voiceSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-voice_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(interaction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(interaction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let voiceEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_TOGGLE_VOICE_HIGHLIGHTS_TITLE')).setDescription(localize(interaction.locale, 'SETUP_TOGGLE_VOICE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [voiceEmbed], components: [voiceSelect] });
                break;


            // HIGHLIGHT STAGES OPTION
            case 'HIGHLIGHT_STAGES':
                // Create Select
                let stageSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-stage_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(interaction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(interaction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let stageEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_TOGGLE_STAGE_HIGHLIGHTS_TITLE')).setDescription(localize(interaction.locale, 'SETUP_TOGGLE_STAGE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [stageEmbed], components: [stageSelect] });
                break;


            // HIGHLIGHT THREADS OPTION
            case 'HIGHLIGHT_THREADS':
                // Create Select
                let threadSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-thread_${interaction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(interaction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(interaction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let threadEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(interaction.locale, 'SETUP_TOGGLE_THREAD_HIGHLIGHTS_TITLE')).setDescription(localize(interaction.locale, 'SETUP_TOGGLE_THREAD_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await interaction.update({ content: null, embeds: [threadEmbed], components: [threadSelect] });
                break;


            // SAVE AND MOVE ONTO STEP 2
            case 'SAVE_AND_CREATE':
                await setupStep2(interaction, SettingValueKeys);
                break;


            // CANCEL OPTION
            case 'CANCEL':
                await interaction.update({ content: localize(interaction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                await interaction.update({ content: `\n\n:warning: ${localize(interaction.locale, 'SELECT_MENU_ERROR_GENERIC')}` });
                break;
        }

        return;
    }
}











/**
 * Triggers step 2 of the Setup Command
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {String[]} settingValues 
 */
async function setupStep2(interaction, settingValues)
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
