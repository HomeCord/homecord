const { ApplicationCommandType, ApplicationCommandData, ContextMenuCommandInteraction, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, MessageType } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");
const { GuildConfig, FeaturedMessage, UserConfig, GuildBlocklist } = require("../../../Mongoose/Models");

// Disallowed Message Types for highlighting
const DisallowedMessageTypes = [ MessageType.AutoModerationAction, MessageType.Call, MessageType.ChannelFollowAdd, MessageType.ChannelIconChange,
    MessageType.ChannelNameChange, MessageType.ChannelPinnedMessage, MessageType.ChatInputCommand, MessageType.ContextMenuCommand, MessageType.GuildApplicationPremiumSubscription,
    MessageType.GuildBoost, MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3, MessageType.GuildDiscoveryDisqualified,
    MessageType.GuildDiscoveryGracePeriodFinalWarning, MessageType.GuildDiscoveryGracePeriodInitialWarning, MessageType.GuildDiscoveryRequalified,
    MessageType.GuildInviteReminder, MessageType.InteractionPremiumUpsell, MessageType.RecipientAdd, MessageType.RecipientRemove, MessageType.RoleSubscriptionPurchase,
    MessageType.StageEnd, MessageType.StageRaiseHand, MessageType.StageSpeaker, MessageType.StageStart, MessageType.StageTopic, MessageType.ThreadCreated,
    MessageType.UserJoin ];

module.exports = {
    // Command's Name
    //     Can use sentence casing and spaces
    Name: "Feature Message",

    // Command's Description
    Description: `Features the Message to this Server's Home Channel`,

    // Command's Category
    Category: "HOME",

    // Context Command Type
    //     One of either ApplicationCommandType.Message, ApplicationCommandType.User
    CommandType: ApplicationCommandType.Message,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 30,

    // Scope of Command's usage
    //     One of the following: DM, GUILD, ALL
    Scope: "GUILD",



    /**
     * Returns data needed for registering Context Command onto Discord's API
     * @returns {ApplicationCommandData}
     */
    registerData()
    {
        /** @type {ApplicationCommandData} */
        const Data = {};

        Data.name = this.Name;
        Data.description = "";
        Data.type = this.CommandType;
        Data.dmPermission = false;
        Data.defaultMemberPermissions = PermissionFlagsBits.ManageMessages;

        return Data;
    },



    /**
     * Executes the Context Command
     * @param {ContextMenuCommandInteraction} interaction 
     */
    async execute(interaction)
    {
        // Just in case
        await interaction.deferReply({ ephemeral: true });
        
        // Grab Message ID
        const InputMessage = interaction.options.getMessage("message", true);

        // Validate Message
        // Check if Bot Message
        if ( InputMessage.author.bot ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_UNSUPPORTED_BOT_MESSAGE') }); return; }

        // Check if System Message
        if ( InputMessage.system ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_UNSUPPORTED_SYSTEM_MESSAGE') }); return; }

        // Check if Voice Message
        if ( InputMessage.flags.has(MessageFlags.IsVoiceMessage) ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_UNSUPPORTED_VOICE_MESSAGE') }); return; }

        // Check if invalid Message type
        if ( DisallowedMessageTypes.includes(InputMessage.type) ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_UNSUPPORTED_GENERIC') }); return; }

        // Check if Message is too old
        if ( (Date.now() - InputMessage.createdAt.getTime()) > 6.048e+8 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_TOO_OLD') }); return; }

        // Check if Message content is too long
        if ( InputMessage.content.length > 1800 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_TOO_LONG') }); return; }

        // Ensure Server has a Home Channel setup
        if ( await GuildConfig.exists({ guildId: interaction.guildId }) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_HOME_NOT_SETUP') }); return; }

        // Ensure Message isn't already being featured
        if ( await FeaturedMessage.exists({ guildId: interaction.guildId, originalMessageId: InputMessage.id }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_ALREADY_FEATURED', InputMessage.url) }); return; }

        // Ensure Server's Home Channel hasn't hit the maximum amount of featured Messages
        if ( (await FeaturedMessage.find({ guildId: interaction.guildId })).length === 10 ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MAX_MESSAGES_FEATURED') }); return; }

        // Check Message Author's Preferences
        if ( (await UserConfig.findOne({ userId: InputMessage.author.id }))?.isHighlightable == false ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_AUTHOR_PREFERENCES_DISABLED', InputMessage.url) }); return; }

        // Check if Channel or Category is blocked
        if ( await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: interaction.channelId }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_CHANNEL_BLOCKED') }); return; }
        if ( interaction.channel.parentId != null && await GuildBlocklist.exists({ guildId: interaction.guildId, blockedId: interaction.channel.parentId }) != null ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_CATEGORY_BLOCKED') }); return; }

        // Finally, check if Message Author has a blocked Role
        let authorRoles = InputMessage.member.roles.cache;
        let fetchedBlockedRoles = await GuildBlocklist.find({ guildId: interaction.guildId, blockType: "ROLE" });
        if ( fetchedBlockedRoles.length > 0 ) {
            let hasBlockedRole = false;
            // Using For Statement instead of forEach just so I can use the break statement
            for ( let i = 0; i <= fetchedBlockedRoles.length - 1; i++ )
            {
                if ( authorRoles.has(fetchedBlockedRoles[i].blockedId) ) { hasBlockedRole = true; break; }
            }

            // ACK
            if ( hasBlockedRole ) { await interaction.editReply({ content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_AUTHOR_ROLE_BLOCKED', InputMessage.url) }); return; }
        }


        

        // Construct Select for duration
        const DurationSelect = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId(`feature-message_${InputMessage.id}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'PLEASE_SELECT_A_DURATION')).addOptions([
                new StringSelectMenuOptionBuilder().setValue(`TWELVE_HOURS`).setLabel(localize(interaction.locale, 'TWELVE_HOURS')),
                new StringSelectMenuOptionBuilder().setValue(`ONE_DAY`).setLabel(localize(interaction.locale, 'ONE_DAY')),
                new StringSelectMenuOptionBuilder().setValue(`THREE_DAYS`).setLabel(localize(interaction.locale, 'THREE_DAYS')),
                new StringSelectMenuOptionBuilder().setValue(`SEVEN_DAYS`).setLabel(localize(interaction.locale, 'SEVEN_DAYS'))
            ])
        );

        // ACK so Server Modmin (Mod or Admin) can select duration to feature Message for
        await interaction.editReply({ components: [DurationSelect], content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_SELECT_DURATION', InputMessage.url) });

        return;
    }
}
