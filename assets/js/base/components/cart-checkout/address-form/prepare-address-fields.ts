/** @typedef { import('@woocommerce/type-defs/address-fields').CountryAddressFields } CountryAddressFields */

/**
 * Internal dependencies
 */
import defaultAddressFields from './default-address-fields';
import countryAddressFields from './country-address-fields';
import type {
	AddressFieldConfiguration,
	AddressFields,
	KeyedAddressFieldConfiguration,
} from '../../../../type-defs/customer';

/**
 * Combines address fields, including fields from the locale, and sorts them by index.
 *
 * @param {Array} fields List of field keys--only address fields matching these will be returned.
 * @param {Object} fieldConfigs Fields config contains field specific overrides at block level which may, for example, hide a field.
 * @param {string} addressCountry Address country code. If unknown, locale fields will not be merged.
 */
const prepareAddressFields = (
	fields: ( keyof AddressFields )[] | undefined,
	fieldConfigs: Record<
		keyof AddressFields,
		Partial< AddressFieldConfiguration >
	>,
	addressCountry = ''
): KeyedAddressFieldConfiguration[] => {
	const localeConfigs =
		addressCountry && countryAddressFields[ addressCountry ] !== undefined
			? countryAddressFields[ addressCountry ]
			: {};

	if ( fields === undefined ) {
		return [];
	}

	return fields
		.map( ( field ) => {
			const defaultConfig =
				defaultAddressFields[ field ] || Object.assign( {} );
			const localeConfig = localeConfigs[ field ] || Object.assign( {} );
			const fieldConfig = fieldConfigs[ field ] || Object.assign( {} );

			return {
				key: field,
				...defaultConfig,
				...localeConfig,
				...fieldConfig,
			};
		} )
		.sort( ( a, b ) => a.index - b.index );
};

export default prepareAddressFields;
