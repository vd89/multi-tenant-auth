/**
 * DATABASE TOKENS - Provider Injection Keys
 *
 * WHY SYMBOLS?
 * - Guaranteed uniqueness (Symbol() !== Symbol())
 * - Prevents naming collisions across modules
 * - Can't be accidentally recreated with same string
 *
 * WHEN TO USE EACH:
 * - DATABASE_CONNECTION: For the actual TypeORM DataSource
 * - DATABASE_OPTIONS: For configuration objects
 * - CONNECTION_MANAGER: For service that manages connections
 */

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export const DATABASE_OPTIONS = Symbol('DATABASE_OPTIONS');
export const CONNECTION_MANAGER = Symbol('CONNECTION_MANAGER');

/**
 * WHY NOT STRINGS?
 * const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
 *
 * Problem: If another module uses same string, NestJS gets confused
 * Symbol ensures this token is unique in the entire application
 */
