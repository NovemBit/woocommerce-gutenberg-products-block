/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import {Icon, search, server} from '@woocommerce/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import edit from './edit.js';

registerBlockType( 'woocommerce/product-search-filter', {
	title: __( 'Product Search Filter', 'woo-gutenberg-products-block' ),
	icon: {
		src: <Icon srcElement={ search } />,
		foreground: '#7f54b3',
	},
	category: 'woocommerce',
	keywords: [ __( 'WooCommerce', 'woo-gutenberg-products-block' ) ],
	description: __(
		'A search box to allow customers to search for products by keyword. Works in combination with the All Products block.',
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
			default: __(
				'Search',
				'woo-gutenberg-products-block'
			),
		},
		headingLevel: {
			type: 'number',
			default: 3,
		},
		/**
		 * Search field placeholder.
		 */
		placeholder: {
			type: 'string',
			default: __( 'Search products…', 'woo-gutenberg-products-block' ),
			// source: 'attribute',
			// selector: 'input.wc-block-product-search__field',
			attribute: 'placeholder',
		},
		/**
		 * Are we previewing?
		 */
		isPreview: {
			type: 'boolean',
			default: false,
		},
	},
	edit,
	// Save the props to post content.
	save( { attributes } ) {
		const {
			className,
			heading,
			headingLevel,
			placeholder,
		} = attributes;
		const data = {
			'data-heading': heading,
			'data-heading-level': headingLevel,
			'data-placeholder': placeholder,
		};
		return (
			<div
				className={ classNames( 'is-loading', className ) }
				{ ...data }
			>
				<span
					aria-hidden
					className="wc-block-product-stock-filter__placeholder"
				/>
			</div>
		);
	},
} );
