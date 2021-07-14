/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';
import {
	Disabled,
	PanelBody,
	SelectControl,
	ToggleControl,
	withSpokenMessages,
} from '@wordpress/components';
import HeadingToolbar from '@woocommerce/editor-components/heading-toolbar';
import BlockTitle from '@woocommerce/editor-components/block-title';

/**
 * Internal dependencies
 */
import Block from './block.js';

const Edit = ( { attributes, setAttributes } ) => {
	const { className, heading, headingLevel, showFilterButton } = attributes;

	const getInspectorControls = () => {
		return (
			<InspectorControls key="inspector">
				<PanelBody
					title={ __( 'Content', 'woo-gutenberg-products-block' ) }
				>
					<p>
						{ __(
							'Heading Level',
							'woo-gutenberg-products-block'
						) }
					</p>
					<HeadingToolbar
						isCollapsed={ false }
						minLevel={ 2 }
						maxLevel={ 7 }
						selectedLevel={ headingLevel }
						onChange={ ( newLevel ) =>
							setAttributes( { headingLevel: newLevel } )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __(
						'Block Settings',
						'woo-gutenberg-products-block'
					) }
				>
					<SelectControl
						label={ __(
							'Order Products By',
							'woo-gutenberg-products-block'
						) }
						value={ attributes.orderby }
						options={ [
							{
								label: __(
									'Default sorting (menu order)',
									'woo-gutenberg-products-block'
								),
								value: 'menu_order',
							},
							{
								label: __(
									'Popularity',
									'woo-gutenberg-products-block'
								),
								value: 'popularity',
							},
							{
								label: __(
									'Average rating',
									'woo-gutenberg-products-block'
								),
								value: 'rating',
							},
							{
								label: __(
									'Latest',
									'woo-gutenberg-products-block'
								),
								value: 'date',
							},
							{
								label: __(
									'Price: low to high',
									'woo-gutenberg-products-block'
								),
								value: 'price',
							},
							{
								label: __(
									'Price: high to low',
									'woo-gutenberg-products-block'
								),
								value: 'price-desc',
							},
						] }
						onChange={ ( orderby ) => setAttributes( { orderby } ) }
					/>
				</PanelBody>
			</InspectorControls>
		);
	};

	return (
		<>
			{ getInspectorControls() }
			{
				<div className={ className }>
					<BlockTitle
						headingLevel={ headingLevel }
						heading={ heading }
						onChange={ ( value ) =>
							setAttributes( { heading: value } )
						}
					/>
					<Disabled>
						<Block attributes={ attributes } isEditor={ true } />
					</Disabled>
				</div>
			}
		</>
	);
};

export default withSpokenMessages( Edit );
