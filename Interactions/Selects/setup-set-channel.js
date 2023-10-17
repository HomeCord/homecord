const { ChannelSelectMenuInteraction, ChannelType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const { localize } = require("../../BotModules/LocalizationModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "setup-set-channel",

    // Select's Description
    Description: `Checks & sets an existing Channel to be used as the Home Channel`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Select
     * @param {ChannelSelectMenuInteraction} selectInteraction 
     */
    async execute(selectInteraction)
    {
        // Fetch Channel selected
        const SelectedChannel = selectInteraction.channels.first();
        
        if ( SelectedChannel == undefined )
        {
            await selectInteraction.update({ content: localize(selectInteraction.locale, 'SELECT_MENU_ERROR_GENERIC') });
            return;
        }

        // Just in case, validate Channel is Text Channel
        if ( SelectedChannel.type != ChannelType.GuildText )
        {
            await selectInteraction.update({ content: localize(selectInteraction.locale, 'SETUP_SET_CHANNEL_ERROR_INVALID_CHANNEL_TYPE') });
            return;
        }

        // Store into custom ID
        let settingValues = selectInteraction.customId.split("_");
        settingValues.shift(); // Remove custom ID
        settingValues[0] = `${SelectedChannel.id}`; // Replace Channel value

        
        // Return to main Setup Page
        let setupEmbed = new EmbedBuilder().setColor('Grey')
        .setTitle(localize(selectInteraction.locale, 'SETUP_EMBED_TITLE'))
        .setDescription(localize(selectInteraction.locale, 'SETUP_EMBED_DESCRIPTION'))
        .addFields(
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_CHANNEL'), value: settingValues[0] === 'c' ? 'CREATE_CHANNEL_FOR_ME' : `<#${settingValues[0]}>` },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_ACTIVITY_THRESHOLD'), value: localize(selectInteraction.locale, settingValues[1] === 'vl' ? 'VERY_LOW' : settingValues[1] === 'l' ? 'LOW' : settingValues[1] === 'm' ? 'MEDIUM' : settingValues[1] === 'h' ? 'HIGH' : 'VERY_HIGH') },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_HIGHLIGHT_MESSAGES'), value: localize(selectInteraction.locale, settingValues[2] === 't' ? 'TRUE' : 'FALSE') },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_HIGHLIGHT_SCHEDULED_EVENTS'), value: localize(selectInteraction.locale, settingValues[3] === 't' ? 'TRUE' : 'FALSE') },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_HIGHLIGHT_VOICE_ACTIVITY'), value: localize(selectInteraction.locale, settingValues[4] === 't' ? 'TRUE' : 'FALSE') },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_HIGHLIGHT_LIVE_STAGES'), value: localize(selectInteraction.locale, settingValues[5] === 't' ? 'TRUE' : 'FALSE') },
            { name: localize(selectInteraction.locale, 'SETUP_EMBED_HIGHLIGHT_ACTIVE_THREADS'), value: localize(selectInteraction.locale, settingValues[6] === 't' ? 'TRUE' : 'FALSE') },
        )
        .setFooter({ text: localize(selectInteraction.locale, 'SETUP_EMBED_FOOTER_STEP_ONE') });

        let setupActionRow = new ActionRowBuilder().addComponents(
            // *******  NOTE ABOUT THE CUSTOM ID
            // The bits after "setup-home_" are used to know what the set values are for each setting
            // In order:
            //   - Home Channel location ("c" = create for me; otherwise ID of Channel)
            //   - Activity Threshold ("vl" = very low; "l" = low; "m" = medium; "h" = high; "vh" = very high)
            //   - Highlight Messages, Events, Voice, Stages, Threads (in that order. "t" = true; "f" = false)
            new StringSelectMenuBuilder().setCustomId(`setup-home_${settingValues.join('_')}`).setMaxValues(1).setMinValues(1).setPlaceholder(localize(selectInteraction.locale, 'PLEASE_SELECT_AN_OPTION'))
            .addOptions(
                new StringSelectMenuOptionBuilder().setValue('CHANNEL').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_CHANNEL')).setDescription(localize(selectInteraction.locale, 'SETUP_EMBED_CHANNEL_DESCRIPTION')).setEmoji(`⚙`),
                new StringSelectMenuOptionBuilder().setValue('ACTIVITY_THRESHOLD').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_ACTIVITY')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_EDIT_ACTIVITY_THRESHOLD')).setEmoji(`📊`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_MESSAGES').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_MESSAGES')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_TOGGLE_MESSAGES')).setEmoji(`<:ChannelText:997752062500671590>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_EVENTS').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_EVENTS')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_TOGGLE_EVENTS')).setEmoji(`<:ScheduledEvent:1009372447503552514>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_VOICE').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_VOICE')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_TOGGLE_VOICE')).setEmoji(`<:ChannelVoice:997752063612162138>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_STAGES').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_STAGES')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_TOGGLE_STAGES')).setEmoji(`<:ChannelStage:997752061330464818>`),
                new StringSelectMenuOptionBuilder().setValue('HIGHLIGHT_THREADS').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_THREADS')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_TOGGLE_THREADS')).setEmoji(`<:ChannelForum:1029012363048914967>`),
                new StringSelectMenuOptionBuilder().setValue('SAVE_AND_CREATE').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_SAVE_AND_CREATE')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_SAVE')).setEmoji(`✅`),
                new StringSelectMenuOptionBuilder().setValue('CANCEL').setLabel(localize(selectInteraction.locale, 'SETUP_SELECT_LABEL_CANCEL')).setDescription(localize(selectInteraction.locale, 'SETUP_SELECT_CANCEL')).setEmoji(`❌`),
            )
        );


        await selectInteraction.update({ content: null, embeds: [setupEmbed], components: [setupActionRow] });
        return;
    }
}
