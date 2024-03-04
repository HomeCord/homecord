const { GuildConfig } = require("../Mongoose/Models");
const { DiscordClient } = require("../constants");
const { removeGuild } = require("./DatabaseModule");


module.exports = {

    /**
     * Resets Home Channel due to deleted Message!
     * 
     * @param {String} guildId 
     */
    async resetHome(guildId)
    {
        // JUST IN CASE
        if ( guildId == null ) { return; }

        // First grab webhook so that the notice can be sent!
        const ConfigEntry = await GuildConfig.findOne({ guildId: guildId });
        let fetchedHomeWebhook = await DiscordClient.fetchWebhook(ConfigEntry.homeWebhookId);
        let fetchedGuild = await DiscordClient.guilds.fetch(guildId);

        // Just to make sure Discord Outages don't break things further
        if ( !fetchedGuild.available ) { return; }

        // Send Message
        await fetchedHomeWebhook.send({ allowedMentions: { parse: [] }, content: `:warning: **Notice: This Home Channel has been broken due to deletion of one of its core 3 Messages in this Channel.**\n\nPlease reset this Home Channel by using the \`/setup\` Command. This Server's Home Block List will not be affected by this reset.` });

        
        // Now, purge DB ;-;
        await removeGuild(guildId, true);

        return;
    },
    




    /**
     * Resets Home Channel due to deleted Webhook/Channel! (and thus cannot send message)
     * 
     * @param {String} guildId 
     */
    async resetHomeSliently(guildId)
    {
        // JUST IN CASE
        if ( guildId == null ) { return; }
        
        // Now, purge DB ;-;
        await removeGuild(guildId, true);

        return;
    }

}
