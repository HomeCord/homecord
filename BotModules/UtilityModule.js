const { ApplicationCommand, Collection } = require("discord.js");
const { DiscordClient } = require("../constants");


module.exports = {
    /**
     * Calculates the ISO Timestamp based off the duration inputted via commands
     * @param {'TWELVE_HOURS'|'ONE_DAY'|'THREE_DAYS'|'FIVE_DAYS'|'SEVEN_DAYS'} durationInput 
     */
    calculateIsoTimeUntil(durationInput)
    {
        const now = Date.now();
        /** ISO String
         * @type {String} */
        let calculatedIsoTimestamp;

        switch (durationInput)
        {
            case "TWELVE_HOURS":
                calculatedIsoTimestamp = new Date(now + 4.32e+7).toISOString();
                break;

            case "ONE_DAY":
                calculatedIsoTimestamp = new Date(now + 8.64e+7).toISOString();
                break;

            case "THREE_DAYS":
                calculatedIsoTimestamp = new Date(now + 2.592e+8).toISOString();
                break;
            
            case "FIVE_DAYS":
                calculatedIsoTimestamp = new Date(now + 4.32e+8).toISOString();
                break;

            case "SEVEN_DAYS":
                calculatedIsoTimestamp = new Date(now + 6.048e+8).toISOString();
                break;
        }

        return calculatedIsoTimestamp;
    },




    /**
     * Calculates the Unix Timestamp in milliseconds based off the duration inputted via commands
     * @param {'TWELVE_HOURS'|'ONE_DAY'|'THREE_DAYS'|'FIVE_DAYS'|'SEVEN_DAYS'} durationInput 
     */
    calculateUnixTimeUntil(durationInput)
    {
        const now = Date.now();
        /** ISO String
         * @type {String} */
        let calculatedUnixTimestamp;

        switch (durationInput)
        {
            case "TWELVE_HOURS":
                calculatedUnixTimestamp = new Date(now + 4.32e+7).getTime();
                break;

            case "ONE_DAY":
                calculatedUnixTimestamp = new Date(now + 8.64e+7).getTime();
                break;

            case "THREE_DAYS":
                calculatedUnixTimestamp = new Date(now + 2.592e+8).getTime();
                break;

            case "FIVE_DAYS":
                calculatedUnixTimestamp = new Date(now + 4.32e+8).getTime();
                break;

            case "SEVEN_DAYS":
                calculatedUnixTimestamp = new Date(now + 6.048e+8).getTime();
                break;
        }

        return calculatedUnixTimestamp;
    },
    



    /**
     * Calculates the milliseconds based off the duration inputted via commands, for use in setTimeout()
     * @param {'TWELVE_HOURS'|'ONE_DAY'|'THREE_DAYS'|'FIVE_DAYS'|'SEVEN_DAYS'} durationInput 
     */
    calculateTimeoutDuration(durationInput)
    {
        const now = Date.now();
        /** ISO String
         * @type {Number} */
        let calculatedDuration;

        switch (durationInput)
        {
            case "TWELVE_HOURS":
                calculatedDuration = 4.32e+7;
                break;

            case "ONE_DAY":
                calculatedDuration = 8.64e+7;
                break;

            case "THREE_DAYS":
                calculatedDuration = 2.592e+8;
                break;

            case "FIVE_DAYS":
                calculatedDuration = 4.32e+8;
                break;

            case "SEVEN_DAYS":
                calculatedDuration = 6.048e+8;
                break;
        }

        return calculatedDuration;
    },
    



    /**
     * Fetches the Command Mention for the given Command Name
     * 
     * @param {String} commandName 
     * @param {?String} guildId Only include if wanted Command is a guild-specific Command, not global Command
     * 
     * @returns {?String} String Command Mention, or NULL if not found
     */
    async fetchCommandMention(commandName, guildId)
    {
        // If subcommand and/or subcommand group was given, slice them out for ease in finding Commands
        let rootCommandName = "";
        if ( commandName.includes(" ") ) { rootCommandName = commandName.split(" ")[0]; }
        else { rootCommandName = commandName; }

        // Fetch Commands based off scope
        /** @type {Collection<String, ApplicationCommand>} */
        let fetchedCommands;

        if ( guildId == null ) { fetchedCommands = await DiscordClient.application.commands.fetch(); }
        else { fetchedCommands = await DiscordClient.application.commands.fetch({ guildId: guildId }); }

        // Find Command with name
        let filteredCommand = fetchedCommands.find(command => command.name === rootCommandName);
        
        if ( !filteredCommand ) { return null; }
        else { return `</${commandName}:${filteredCommand.id}>`; }
    }
}
