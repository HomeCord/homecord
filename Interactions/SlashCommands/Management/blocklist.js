const { ChatInputCommandInteraction, ChatInputApplicationCommandData, ApplicationCommandType, AutocompleteInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");

module.exports = {
    // Command's Name
    //     Use full lowercase
    Name: "blocklist",

    // Command's Description
    Description: `View this Server's Home Block List`,

    // Command's Localised Descriptions
    LocalisedDescriptions: {
        'en-GB': `View this Server's Home Block List`,
        'en-US': `View this Server's Home Block List`
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
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

        return Data;
    },



    /**
     * Executes the Slash Command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });


        // Fetch everything in this Server's Block List
        let fetchedBlockList = await GuildBlocklist.find({ guildId: interaction.guildId });

        // If nothing in Block List, return early
        if ( fetchedBlockList.length < 1 ) { await interaction.editReply({ content: localize(interaction.locale, 'BLOCKLIST_COMMAND_EMPTY') }); return; }


        // Split up the different Blocked Items
        let blockedRoles = [];
        let blockedChannels = [];
        let blockedCategories = [];

        fetchedBlockList.forEach(document => {
            if ( document.blockType === "ROLE" ) { blockedRoles.push(`<@&${document.blockedId}>`); }
            else if ( document.blockType === "CHANNEL" ) { blockedChannels.push(`<#${document.blockedId}>`); }
            else if ( document.blockType === "CATEGORY" ) { blockedCategories.push(`<#${document.blockedId}>`); }
        });


        // Construct into Embed
        let blockListEmbed = new EmbedBuilder().setColor('Grey')
        .setTitle(localize(interaction.locale, 'BLOCKLIST_COMMAND_EMBED_TITLE', interaction.guild.name))
        .setDescription(localize(interaction.locale, 'BLOCKLIST_COMMAND_EMBED_DESCRIPTION', `\`/block\``, `\`/unblock\``))
        .addFields(
            { name: localize(interaction.locale, 'BLOCKLIST_COMMAND_HEADER_ROLES', `${blockedRoles.length}`), value: blockedRoles.length < 1 ? localize(interaction.locale, 'BLOCKLIST_COMMAND_ROLES_EMPTY') : blockedRoles.join(', ') },
            { name: localize(interaction.locale, 'BLOCKLIST_COMMAND_HEADER_CHANNELS', `${blockedChannels.length}`), value: blockedChannels.length < 1 ? localize(interaction.locale, 'BLOCKLIST_COMMAND_CHANNELS_EMPTY') : blockedRoles.join(', ') },
            { name: localize(interaction.locale, 'BLOCKLIST_COMMAND_HEADER_CATEGORIES', `${blockedCategories.length}`), value: blockedCategories.length < 1 ? localize(interaction.locale, 'BLOCKLIST_COMMAND_CATEGORIES_EMPTY') : blockedRoles.join(', ') }
        );


        // ACK
        await interaction.editReply({ embeds: [blockListEmbed] });
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
