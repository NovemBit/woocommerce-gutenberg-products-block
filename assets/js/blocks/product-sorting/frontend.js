/**
 * External dependencies
 */
import { renderFrontend } from '@woocommerce/base-utils';

/**
 * Internal dependencies
 */
import Block from './block.js';

const getProps = ( el ) => {
	return {
		attributes: {
			heading: el.dataset.heading,
			headingLevel: el.dataset.headingLevel || 3,
		},
	};
};

renderFrontend( {
	selector: '.wp-block-woocommerce-product-sorting',
	Block,
	getProps,
} );
