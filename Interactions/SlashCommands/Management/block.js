const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "block",

    // Command's Description
    Description: `View or add to your Server's Home Block List`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `View or add to your Server's Home Block List`,
        'en-US': `View or add to your Server's Home Block List`
    },

    // Command's Category
    Category: "MANAGEMENT",

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 15,

    // Cooldowns for specific subcommands and/or subcommand-groups
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandCooldown: {
        "list": 15,
        "channel": 30,
        "role": 30
    },

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",

    // Scope of specific Subcommands Usage
    //     One of the following: DM, GUILD, ALL
    //     IF SUBCOMMAND: name as "subcommandName"
    //     IF SUBCOMMAND GROUP: name as "subcommandGroupName_subcommandName"
    SubcommandScope: {
        "list": "GUILD",
        "channel": "GUILD",
        "role": "GUILD"
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
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;
        Data.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "list",
                description: "View your Server's Home Block List",
                descriptionLocalizations: {
                    'en-GB': "View your Server's Home Block List",
                    'en-US': "View your Server's Home Block List"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "channel",
                description: "Add a Channel or Category to your Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add a Channel or Category to your Home Block List",
                    'en-US': "Add a Channel or Category to your Home Block List"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Channel,
                        name: "channel",
                        description: "Channel or Category to block",
                        descriptionLocalizations: {
                            'en-GB': "Channel or Category to block",
                            'en-US': "Channel or Category to block"
                        },
                        required: true,
                        channelTypes: [ ChannelType.GuildAnnouncement, ChannelType.GuildCategory, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice ]
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "role",
                description: "Add a Role to your Home Block List",
                descriptionLocalizations: {
                    'en-GB': "Add a Role to your Home Block List",
                    'en-US': "Add a Role to your Home Block List"
                },
                options: [
                    {
                        type: ApplicationCommandOptionType.Role,
                        name: "role",
                        description: "Role to block",
                        descriptionLocalizations: {
                            'en-GB': "Role to block",
                            'en-US': "Role to block"
                        },
                        required: true
                    }
                ]
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
        //.
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
