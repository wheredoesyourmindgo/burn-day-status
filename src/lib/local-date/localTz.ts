import {tz} from '@date-fns/tz'

/**
 * The local timezone used in the application.
 * It is set to 'America/Los_Angeles'.
 */
export const LOCAL_TIMEZONE = 'America/Los_Angeles'

/**
 * A utility function that returns the timezone object corresponding
 * to the local timezone as defined.
 *
 * This is used to apply or manage dates in the local timezone.
 *
 * @returns {Function} A function that represents the local timezone as defined.
 */
const localTz = tz(LOCAL_TIMEZONE)

export default localTz
