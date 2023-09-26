const { ContextMenuCommandInteraction, DMChannel, Collection } = require("discord.js");
const { Collections } = require("../../constants.js");
const { localize } = require("../LocalizationModule.js");

module.exports = {
    /**
     * Handles and runs received Context Commands
     * @param {ContextMenuCommandInteraction} contextInteraction 
     */
    async Main(contextInteraction)
    {
        // Catch for spaces in Context Command Names
        if ( contextInteraction.commandName.includes(" ") )
        {
            contextInteraction.commandName = contextInteraction.commandName.split("_").join(" ");
        }

        const ContextCommand = Collections.ContextCommands.get(contextInteraction.commandName);

        if ( !ContextCommand )
        {
            // Couldn't find the file for this Context Command
            return await contextInteraction.reply({ ephemeral: true, content: `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_GENERIC')}` });
        }

        // DM Check
        if ( ContextCommand.Scope === 'DM' && !(contextInteraction.channel instanceof DMChannel) )
        {
            return await contextInteraction.reply({ ephemeral: true, content: `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_GUILDS_UNSUPPORTED')}` });
        }

        // Guild Check
        if ( ContextCommand.Scope === 'GUILD' && (contextInteraction.channel instanceof DMChannel) )
        {
            return await contextInteraction.reply({ ephemeral: true, content: `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_DMS_UNSUPPORTED')}` });
        }



        // Context Command Cooldowns
        if ( !Collections.ContextCooldowns.has(ContextCommand.Name) )
        {
            // No active Cooldowns found, create new one
            Collections.ContextCooldowns.set(ContextCommand.Name, new Collection());
        }

        // Set initial values
        const Now = Date.now();
        /** @type {Collection} */
        const Timestamps = Collections.ContextCooldowns.get(ContextCommand.Name);
        const CooldownAmount = ( ContextCommand.Cooldown || 3 ) * 1000;

        // Cooldown
        if ( Timestamps.has(contextInteraction.user.id) )
        {
            // Cooldown hit, tell User to cool off a little bit
            const ExpirationTime = Timestamps.get(contextInteraction.user.id) + CooldownAmount;

            if ( Now < ExpirationTime )
            {
                let timeLeft = ( ExpirationTime - Now ) / 1000; // How much time is left of cooldown, in seconds

                switch (timeLeft)
                {
                    // MINUTES
                    case timeLeft >= 60 && timeLeft < 3600:
                        timeLeft = timeLeft / 60; // For UX
                        let cooldownMinutesMessage = `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_COOLDOWN_MINUTES', timeLeft.toFixed(1))}`;
                        return await contextInteraction.reply({ ephemeral: true, content: cooldownMinutesMessage });

                    // HOURS
                    case timeLeft >= 3600 && timeLeft < 86400:
                        timeLeft = timeLeft / 3600; // For UX
                        let cooldownHoursMessage = `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_COOLDOWN_HOURS', timeLeft.toFixed(1))}`;
                        return await contextInteraction.reply({ ephemeral: true, content: cooldownHoursMessage });

                    // DAYS
                    case timeLeft >= 86400 && timeLeft < 2.628e+6:
                        timeLeft = timeLeft / 86400; // For UX
                        let cooldownDaysMessage = `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_COOLDOWN_DAYS', timeLeft.toFixed(1))}`;
                        return await contextInteraction.reply({ ephemeral: true, content: cooldownDaysMessage });

                    // MONTHS
                    case timeLeft >= 2.628e+6:
                        timeLeft = timeLeft / 2.628e+6; // For UX
                        let cooldownMonthsMessage = `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_COOLDOWN_MONTHS', timeLeft.toFixed(1))}`;
                        return await contextInteraction.reply({ ephemeral: true, content: cooldownMonthsMessage });

                    // SECONDS
                    default:
                        let cooldownSecondsMessage = `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_COOLDOWN_SECONDS', timeLeft.toFixed(1))}`;
                        return await contextInteraction.reply({ ephemeral: true, content: cooldownSecondsMessage });
                }
            }
        }
        else
        {
            // Create new cooldown
            Timestamps.set(contextInteraction.user.id, Now);
            setTimeout(() => Timestamps.delete(contextInteraction.user.id), CooldownAmount);
        }



        // Attempt to run Command
        try { await ContextCommand.execute(contextInteraction); }
        catch (err)
        {
            //console.error(err);
            if ( contextInteraction.deferred )
            {
                await contextInteraction.editReply({ content: `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_GENERIC')}` });
            }
            else
            {
                await contextInteraction.reply({ ephemeral: true, content: `${localize(contextInteraction.locale, 'CONTEXT_COMMAND_ERROR_GENERIC')}` });
            }
        }

        return;
    }
}
