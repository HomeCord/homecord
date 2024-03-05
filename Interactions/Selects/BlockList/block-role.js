const { RoleSelectMenuInteraction } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");
const { LogToUserInteraction, LogError } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "block-role",

    // Select's Description
    Description: `Adds the selected Roles to the Server's Block List`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 5,



    /**
     * Executes the Select
     * @param {RoleSelectMenuInteraction} interaction 
     */
    async execute(interaction)
    {
        await interaction.deferUpdate();

        // Fetch all Roles inputted
        let inputRoles = interaction.roles;

        // Filter out Roles already added in DB
        let dbFilter = [];
        inputRoles.forEach(role => {
            dbFilter.push({ blockedId: role.id });
        });

        await GuildBlocklist.find({ guildId: interaction.guildId, $or: dbFilter })
        .then(async existingEntries => {

            if ( existingEntries.length >= 1 )
            {
                // Check Roles already added
                let alreadyAddedRoles = [];
                existingEntries.forEach(document => {
                    alreadyAddedRoles.push(document.blockedId);
                    inputRoles.delete(document.blockedId); // Remove from list of Roles to add
                });

                if ( inputRoles.size < 1 ) { await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ALL_ROLES_ALREADY_ADDED') }); return; }

                // Add Roles NOT already in DB to the DB
                let addRoleDocuments = [];
                inputRoles.forEach(role => {
                    addRoleDocuments.push({ guildId: interaction.guildId, blockType: "ROLE", blockedId: role.id });
                });

                await GuildBlocklist.create(addRoleDocuments)
                .then(async newDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'BLOCK_COMMAND_ROLE_SUCCESSFUL', inputRoles.map(role => `<@&${role.id}>`).join(', '))}\n\n${localize(interaction.locale, 'BLOCK_COMMAND_SOME_ROLES_ALREADY_ADDED', alreadyAddedRoles.map(existingRole => `<@&${existingRole}>`).join(', '))}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_GENERIC_ROLES') });

                    return;
                });

                return;
            }
            else
            {
                // Add Roles  to the DB
                let addRoleDocuments = [];
                inputRoles.forEach(role => {
                    addRoleDocuments.push({ guildId: interaction.guildId, blockType: "ROLE", blockedId: role.id });
                });

                await GuildBlocklist.create(addRoleDocuments)
                .then(async newDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'BLOCK_COMMAND_ROLE_SUCCESSFUL', inputRoles.map(role => `<@&${role.id}>`).join(', '))}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'BLOCK_COMMAND_ERROR_GENERIC_ROLES') });

                    return;
                });

                return;
            }

        });
    }
}
