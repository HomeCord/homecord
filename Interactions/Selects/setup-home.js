const { StringSelectMenuInteraction, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
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
            // CHANNEL OPTION
            case 'CHANNEL':
                // Create Channel Select
                let channelSelect = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder().setCustomId(`setup-set-channel_${selectInteraction.customId.slice(11)}`).setChannelTypes([ChannelType.GuildText]).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_SELECT_PLACEHOLDER'))
                );
                // Create Buttons
                let channelButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`setup-create-channel_${selectInteraction.customId.slice(11)}`).setStyle(ButtonStyle.Primary).setLabel(localize(selectInteraction.locale, 'SETUP_CREATE_CHANNEL_BUTTON_LABEL'))
                );
                // Create Embed
                let channelEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_EMBED_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [channelEmbed], components: [channelSelect, channelButtons] });
                break;


            // ACTIVITY THRESHOLD OPTION
            case 'ACTIVITY_THRESHOLD':
                // Create Activity Select
                let activitySelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-activity_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`VERY_LOW`).setLabel(localize(selectInteraction.locale, 'VERY_LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`LOW`).setLabel(localize(selectInteraction.locale, 'LOW')),
                        new StringSelectMenuOptionBuilder().setValue(`MEDIUM`).setLabel(localize(selectInteraction.locale, 'MEDIUM')),
                        new StringSelectMenuOptionBuilder().setValue(`HIGH`).setLabel(localize(selectInteraction.locale, 'HIGH')),
                        //new StringSelectMenuOptionBuilder().setValue(`VERY_HIGH`).setLabel(localize(selectInteraction.locale, 'VERY_HIGH')) // Saving this option as a future premium option
                    )
                );
                // Create Embed
                let activityEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_SET_ACTIVITY_EMBED_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_SET_ACTIVITY_EMBED_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [activityEmbed], components: [activitySelect] });
                break;


            // HIGHLIGHT MESSAGES OPTION
            case 'HIGHLIGHT_MESSAGES':
                // Create Select
                let messageSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-message_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(selectInteraction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(selectInteraction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let messageEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_TOGGLE_MESSAGE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [messageEmbed], components: [messageSelect] });
                break;


            // HIGHLIGHT EVENTS OPTION
            case 'HIGHLIGHT_EVENTS':
                // Create Select
                let eventSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-event_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(selectInteraction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(selectInteraction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let eventEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_TOGGLE_EVENT_HIGHLIGHTS_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_TOGGLE_EVENT_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [eventEmbed], components: [eventSelect] });
                break;


            // HIGHLIGHT VOICE OPTION
            case 'HIGHLIGHT_VOICE':
                // Create Select
                let voiceSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-voice_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(selectInteraction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(selectInteraction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let voiceEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_TOGGLE_VOICE_HIGHLIGHTS_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_TOGGLE_VOICE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [voiceEmbed], components: [voiceSelect] });
                break;


            // HIGHLIGHT STAGES OPTION
            case 'HIGHLIGHT_STAGES':
                // Create Select
                let stageSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-stage_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(selectInteraction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(selectInteraction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let stageEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_TOGGLE_STAGE_HIGHLIGHTS_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_TOGGLE_STAGE_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [stageEmbed], components: [stageSelect] });
                break;


            // HIGHLIGHT THREADS OPTION
            case 'HIGHLIGHT_THREADS':
                // Create Select
                let threadSelect = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId(`setup-set-thread_${selectInteraction.customId.slice(11)}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION')).setOptions(
                        new StringSelectMenuOptionBuilder().setValue(`TRUE`).setLabel(localize(selectInteraction.locale, 'ENABLE')),
                        new StringSelectMenuOptionBuilder().setValue(`FALSE`).setLabel(localize(selectInteraction.locale, 'DISABLE'))
                    )
                );
                // Create Embed
                let threadEmbed = new EmbedBuilder().setColor('Grey').setTitle(localize(selectInteraction.locale, 'SETUP_TOGGLE_THREAD_HIGHLIGHTS_TITLE')).setDescription(localize(selectInteraction.locale, 'SETUP_TOGGLE_THREAD_HIGHLIGHTS_DESCRIPTION'));
                // ACK
                await selectInteraction.update({ content: null, embeds: [threadEmbed], components: [threadSelect] });
                break;


            // CANCEL OPTION
            case 'CANCEL':
                await selectInteraction.update({ content: localize(selectInteraction.locale, 'SETUP_COMMAND_CANCEL_SETUP'), embeds: [], components: [] });
                break;


            default:
                await selectInteraction.update({ content: `\n\n:warning: ${localize(selectInteraction.locale, 'SELECT_MENU_ERROR_GENERIC')}` });
                break;
        }

        return;
    }
}
