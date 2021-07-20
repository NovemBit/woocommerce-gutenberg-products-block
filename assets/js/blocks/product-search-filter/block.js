/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useQueryStateByKey,
} from '@woocommerce/base-context/hooks';
import {
	Disabled
} from '@wordpress/components';
import { useCallback, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import {TextControl} from "@wordpress/components";

/**
 * Component displaying an stock status filter.
 *
 * @param {Object} props Incoming props for the component.
 * @param {Object} props.attributes Incoming block attributes.
 * @param {boolean} props.isEditor
 */
const ProductSearchFilterBlock = ( {
	attributes: blockAttributes,
	setAttributes: setAttributes,
	isEditor = false,
} ) => {
	const [ search, setSearch ] = useState("");
	const [ searchInput, setSearchInput ] = useState("");

	const [
		productSearchQuery,
		setProductSearchQuery,
	] = useQueryStateByKey( 'search', '' );

	const onChange = useCallback(
		( e ) => {
			setSearch( e.target.value )
			setSearchInput( e )
		},
		[ search, setSearch ]
	);

	const handleEnter = useCallback( ( e ) => {
		if (e.charCode === 13) {
			setSearch( e.target.value )
			setSearchInput( e )
			setProductSearchQuery( search )
		}
	}, [ [ search, setSearch ] ] )

	const onSubmit = () => {
		setProductSearchQuery( search )
	}

	useEffect( () => {
		if( searchInput.target === undefined ){
			return;
		}
		searchInput.target.value = productSearchQuery;
	}, [ productSearchQuery ] );

	const TagName = `h${ blockAttributes.headingLevel }`;

	const markup = 	<button
		type="button"
		className="wc-block-product-search-filter__button"
		onClick={ () => onSubmit() }
		label={ __( 'Search', 'woo-gutenberg-products-block' ) }
	>
		<svg
			aria-hidden="true"
			role="img"
			focusable="false"
			className="dashicon dashicons-arrow-right-alt2"
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
		>
			<path d="M6 15l5-5-5-5 1-2 7 7-7 7z" />
		</svg>
	</button>

	return (
		<>
			{ ! isEditor && blockAttributes.heading && (
				<TagName>{ blockAttributes.heading }</TagName>
			) }
			<div className="wp-block-woocommerce-product-search-filter">
				{ isEditor && <TextControl
					className="wc-block-product-search-filter__field input-control"
					value={ blockAttributes.placeholder }
					onChange={ ( value ) =>
						setAttributes( { placeholder: value } )
					}
				/>}
				{!isEditor && <input
					type="text"
					className="wc-block-product-search-filter__field"
					placeholder={ blockAttributes.placeholder }
					onChange={ e => onChange( e ) }
					onKeyPress={ e => handleEnter(e) }
				/>}
				{ isEditor && <Disabled>
					{markup}
				</Disabled>}
				{!isEditor && markup}

			</div>
		</>
	);
};

export default ProductSearchFilterBlock;
