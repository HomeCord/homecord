import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';
import { DISCORD_APP_USER_ID } from '../../../config.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "news-subscribe",

    /** Command's Description
     * @type {String}
     */
    description: "Subscribe this Server to HomeCord's Updates & Announcements Feed",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': "Subscribe this Server to HomeCord's Updates & Announcements Feed",
        'en-US': "Subscribe this Server to HomeCord's Updates & Announcements Feed"
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 30,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "exampleName": 3
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Permission Requirement
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageWebhooks);
        // Options
        CommandData.options = [{
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "Channel to subscribe this feed to",
            description_localizations: {
                'en-GB': "Channel to subscribe this feed to",
                'en-US': "Channel to subscribe this feed to"
            },
            channel_types: [ ChannelType.GuildText ],
            required: true
        }];

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, api, interactionUser) {
        await api.interactions.createAutocompleteResponse(interaction.id, interaction.token, { choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ] });

        return;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, api, interactionUser, usedCommandName) {
        // Defer, just in case
        await api.interactions.defer(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral });

        // Grab Input
        const InputChannel = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Channel);

        // Attempt to follow Announcement Channel into Input Channel
        await api.channels.followAnnouncements("1265231685142843485", InputChannel.value)
        .then(async () => {
            await api.interactions.editReply(DISCORD_APP_USER_ID, interaction.token, { content: localize(interaction.locale, 'SUBSCRIBE_COMMAND_SUCCESS', `<#${InputChannel.value}>`) });
            return;
        })
        .catch(async (err) => {
            await api.interactions.editReply(DISCORD_APP_USER_ID, interaction.token, { content: localize(interaction.locale, 'SUBSCRIBE_COMMAND_ERROR', `<#${InputChannel.value}>`) });
        });

        return;
    }
}
