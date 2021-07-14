/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { Icon, server } from '@woocommerce/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import edit from './edit.js';

registerBlockType( 'woocommerce/product-sorting', {
	title: __( 'Product Sorting', 'woo-gutenberg-products-block' ),
	icon: {
		src: <Icon srcElement={ server } />,
		foreground: '#96588a',
	},
	category: 'woocommerce',
	keywords: [ __( 'WooCommerce', 'woo-gutenberg-products-block' ) ],
	description: __(
		'Allow customers to sort the grid. Works in combination with the All Products block.',
		'woo-gutenberg-products-block'
	),
	supports: {
		html: false,
		multiple: false,
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
	attributes: {
		heading: {
			type: 'string',
			default: __( 'Product Sorting', 'woo-gutenberg-products-block' ),
		},
		headingLevel: {
			type: 'number',
			default: 3,
		},
		/**
		 * Order to use for the products listing.
		 */
		orderby: {
			type: 'string',
		},
	},
	edit,
	// Save the props to post content.
	save( { attributes } ) {
		const { className, heading, headingLevel, orderby } = attributes;
		const data = {
			'data-heading': heading,
			'data-heading-level': headingLevel,
			'data-orderby': orderby,
		};
		return (
			<div
				className={ classNames( 'is-loading', className ) }
				{ ...data }
			>
				<span
					aria-hidden
					className="wc-block-product-sorting__placeholder"
				/>
			</div>
		);
	},
} );
