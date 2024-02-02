const { ButtonInteraction } = require("discord.js");

module.exports = {
    // Button's Name
    //     Used as its custom ID (or at least the start of it)
    Name: "button_custom_id",

    // Button's Description
    Description: `Description`,

    // Cooldown, in seconds
    //     Defaults to 3 seconds if missing
    Cooldown: 3,



    /**
     * Executes the Button
     * @param {ButtonInteraction} interaction 
     */
    async execute(interaction)
    {
        //.
    }
}
