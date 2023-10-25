const { StringSelectMenuInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { DiscordClient, Collections } = require("../../constants.js");
const { localize } = require("../../BotModules/LocalizationModule.js");

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
     * @param {StringSelectMenuInteraction} selectInteraction 
     */
    async execute(selectInteraction)
    {
        // Grab option selected
        const SelectedOption = selectInteraction.values.pop();
        // Split up Custom ID
        const SettingValueKeys = selectInteraction.customId.split("_");
        SettingValueKeys.shift(); // Remove Custom ID itself

        // Act depending on which option was selected
        switch (SelectedOption)
        {
            case 'REVALIDATE':
                await revalidateHome(selectInteraction, SettingValueKeys);
                break;


            case 'CONFIRM':
                break;


            case 'CANCEL':
                await selectInteraction.update({ content: localize(selectInteraction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                break;
        }

        return;
    }
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
