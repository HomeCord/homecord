const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { DiscordClient, fetchDisplayName } = require("../../../constants");
const { localize } = require("../../../BotModules/LocalizationModule");
const { LogToUserInteraction } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "news",

    // Command's Description
    Description: `Subscribe this Server to HomeCord's Updates & Announcements Feed`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `Subscribe this Server to HomeCord's Updates & Announcements Feed`,
        'en-US': `Subscribe this Server to HomeCord's Updates & Announcements Feed`
    },

    // Command's Category
    Category: "GENERAL",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "example": 3
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "example": "GUILD"
    },



    /**
     * Returns data needed for registering Slash Command onto Discord's API
     * @returns {ChatInputApplicationCommandData}
     */
    registerData()
    {
        /** @type {ChatInputApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = this.Description;
        Data.descriptionLocalizations = this.LocalisedDescriptions;
        Data.type = ApplicationCommandType.ChatInput;
        Data.dmPermission = false;
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageWebhooks;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Channel,
                name: "channel",
                description: "Channel to subscribe this feed to",
                description_localizations: {
                    'en-GB': `Channel to subscribe this feed to`,
                    'en-US': `Channel to subscribe this feed to`
                },
                channel_types: [ ChannelType.GuildText ],
                required: true
            }
        ];

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        // Grab input
        const InputChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);

        // Ensure Bot can actually see the Channel in question
        if ( !InputChannel.permissionsFor(DiscordClient.user.id).has(PermissionFlagsBits.ViewChannel) )
        {
            await interaction.reply({ ephemeral: true, content: localize(interaction.locale, 'SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_VIEW_CHANNEL', `<#${InputChannel.id}>`) });
            return;
        }

        // Check Bot has MANAGE_WEBHOOKS Permission in the Channel
        if ( !InputChannel.permissionsFor(DiscordClient.user.id).has(PermissionFlagsBits.ManageWebhooks) )
        {
            await interaction.reply({ ephemeral: true, content: localize(interaction.locale, 'SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_MANAGE_WEBHOOKS', `<#${InputChannel.id}>`) });
            return;
        }

        // Just in case
        await interaction.deferReply({ ephemeral: true });

        // Fetch Announcement Channels, just in case
        const HomeCordUpdatesChannel = await DiscordClient.channels.fetch("1265231685142843485");


        // Subscribe to feed!
        await HomeCordUpdatesChannel.addFollower(InputChannel.id, localize(interaction.guildLocale, '', fetchDisplayName(interaction.user, true)))
        .then(async () => {
            await interaction.editReply({ content: localize(interaction.locale, 'SUBSCRIBE_COMMAND_SUCCESS', `<#${InputChannel.id}>`) });
            return;
        })
        .catch(async err => {
            await LogToUserInteraction(interaction, null, err);
            return;
        });

        return;
    },



    /**
     * Handles given Autocomplete Interactions for any Options in this Slash CMD that uses it
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction)
    {
        //.
    }
}
