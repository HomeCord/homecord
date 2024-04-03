const { ApplicationCommandType, ApplicationCommandData, ContextMenuCommandInteraction, PermissionFlagsBits } = require("discord.js");
const { localize } = require("../../../BotModules/LocalizationModule");
const { GuildConfig, FeaturedMessage, TimerModel } = require("../../../Mongoose/Models");
const { DiscordClient } = require("../../../constants");
const { refreshMessagesAudio, resetHomeSliently } = require("../../../BotModules/HomeModule");
const { LogError } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Command's Name
    //     Can use sentence casing and spaces
    Name: "Unfeature Message",

    // Command's Description
    Description: `Removes a featured Message from this Server's Home Channel`,

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

        // Ensure Home Channel is actually setup
        if ( await GuildConfig.exists({ guildId: interaction.guildId }) == null ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_HOME_NOT_SETUP') }); return; }

        // Validate Message is a featured message
        if ( await FeaturedMessage.exists({ guildId: interaction.guildId, $or: [{ featuredMessageId: InputMessage.id }, { originalMessageId: InputMessage.id }] }) == null )
        {
            // NOT a featured Message!
            await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_NOT_A_FEATURED_MESSAGE') });
            return;
        }


        // Fetch just so we have the IDs needed
        let fetchedMessageData = await FeaturedMessage.findOne({ guildId: interaction.guildId, $or: [{ featuredMessageId: InputMessage.id }, { originalMessageId: InputMessage.id }] });
        let messageIdInHome = fetchedMessageData.featuredMessageId;
        
        
        // Remove from Database
        await FeaturedMessage.deleteOne({ guildId: interaction.guildId, $or: [{ featuredMessageId: InputMessage.id }, { originalMessageId: InputMessage.id }] })
        .then(async (oldDocument) => {
            try {

                // Grab variables
                let homeConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
                let fetchedHomeWebhook;
                try { fetchedHomeWebhook = await DiscordClient.fetchWebhook(homeConfig.homeWebhookId); }
                catch (err) {
                    await LogError(err);
                    if ( err.name.includes("10015") || err.name.toLowerCase().includes("unknown webhook") )
                    { 
                        await resetHomeSliently(interaction.guildId);
                        await interaction.editReply({ content: localize(interaction.locale, 'ERROR_WEBHOOK_MISSING') });
                        return;
                    }
                    else
                    {
                        await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_GENERIC', InputMessage.url) });
                        return;
                    }
                }

                // Remove from Home Channel
                await fetchedHomeWebhook.deleteMessage(messageIdInHome);

                // Just in case, remove from Timer Table
                await TimerModel.deleteOne({ featuredMessageId: messageIdInHome });

                // Refresh Home Channel's Header
                let refreshState = await refreshMessagesAudio(interaction.guildId, interaction.guildLocale);

                // ACK
                if ( refreshState === true ) { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_SUCCESS') }); }
                else { await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_GENERIC') }); }

                return;

            }
            catch (err) {
                await LogError(err);
                await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_GENERIC') });
                return;
            }
        })
        .catch(async err => {
            await LogError(err);
            await interaction.editReply({ content: localize(interaction.locale, 'UNFEATURE_MESSAGE_COMMAND_ERROR_GENERIC') });
            return;
        });

        return;
    }
}
