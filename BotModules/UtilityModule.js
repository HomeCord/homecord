

module.exports = {
    /**
     * Calculates the ISO Timestamp based off the duration inputted via commands
     * @param {'TWELVE_HOURS'|'ONE_DAY'|'THREE_DAYS'|'SEVEN_DAYS'} durationInput 
     */
    calculateTimeUntil(durationInput)
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

            case "SEVEN_DAYS":
                calculatedIsoTimestamp = new Date(now + 6.048e+8).toISOString();
                break;
        }

        return calculatedIsoTimestamp;
    }
}
