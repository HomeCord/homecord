const { RoleSelectMenuInteraction } = require("discord.js");
const { GuildBlocklist } = require("../../../Mongoose/Models");
const { localize } = require("../../../BotModules/LocalizationModule");
const { LogError } = require("../../../BotModules/LoggingModule");

module.exports = {
    // Select's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "unblock-role",

    // Select's Description
    Description: `Removes the selected Roles from the Server's Block List`,

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

        // Find Roles in DB
        let dbFilter = [];
        inputRoles.forEach(role => {
            dbFilter.push({ blockedId: role.id });
        });

        await GuildBlocklist.find({ guildId: interaction.guildId, $or: dbFilter })
        .then(async existingEntries => {

            // ROLES WERE FOUND IN DB, REMOVE THEM
            if ( existingEntries.length >= 1 )
            {
                // Check Roles NOT in DB
                let rolesInDb = [];
                existingEntries.forEach(document => {
                    rolesInDb.push(document.blockedId);
                    inputRoles.delete(document.blockedId); // Remove from list of Roles to add
                });

                if ( rolesInDb.size < 1 ) { await interaction.editReply({ components: [], content: localize(interaction.locale, 'UNBLOCK_COMMAND_ALL_ROLES_NOT_BLOCKED') }); return; }

                // Remove Roles already in DB from the DB
                let removeRoleDocuments = [];
                rolesInDb.forEach(roleId => {
                    removeRoleDocuments.push({ blockedId: roleId });
                });

                await GuildBlocklist.deleteMany({ $or: removeRoleDocuments })
                .then(async oldDocuments => {

                    // ACK to User
                    await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'UNBLOCK_COMMAND_ROLE_SUCCESSFUL', rolesInDb.map(roleId => `<@&${roleId}>`).join(', '))}${inputRoles.size > 0 ? `\n\n${localize(interaction.locale, 'UNBLOCK_COMMAND_ROLE_NOT_BLOCKED', inputRoles.map(existingRole => `<@&${existingRole.id}>`).join(', '))}` : ''}` });

                    return;

                })
                .catch(async err => {
                    await LogError(err);
                    await interaction.editReply({ components: [], content: localize(interaction.locale, 'UNBLOCK_COMMAND_ERROR_ROLE_GENERIC') });

                    return;
                });

                return;
            }
            // ROLES NOT FOUND, THUS CANNOT REMOVE
            else
            {
                await interaction.editReply({ components: [], content: `${localize(interaction.locale, 'UNBLOCK_COMMAND_ALL_ROLES_NOT_BLOCKED')}` });

                return;
            }

        });
    }
}
