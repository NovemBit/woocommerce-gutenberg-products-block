/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useState, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { PLACEHOLDER_IMG_SRC } from '@woocommerce/settings';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@woocommerce/shared-context';
import { withProductDataContext } from '@woocommerce/shared-hocs';
import { useStoreEvents } from '@woocommerce/base-context/hooks';

/**
 * Internal dependencies
 */
import ProductSaleBadge from './../sale-badge/block';
import './style.scss';
import {
	useBorderProps,
	useSpacingProps,
	useTypographyProps,
} from '../../../../hooks/style-attributes';

/**
 * Product Image Block Component.
 *
 * @param {Object}  props                   Incoming props.
 * @param {string}  [props.className]       CSS Class name for the component.
 * @param {string}  [props.imageSizing]     Size of image to use.
 * @param {boolean} [props.showProductLink] Whether or not to display a link to the product page.
 * @param {boolean} [props.showSaleBadge]   Whether or not to display the on sale badge.
 * @param {string}  [props.saleBadgeAlign]  How should the sale badge be aligned if displayed.
 * @return {*} The component.
 */
export const Block = ( props ) => {
	const {
		className,
		imageSizing = 'full-size',
		showProductLink = true,
		showSaleBadge,
		saleBadgeAlign = 'right',
	} = props;

	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();
	const [ imageLoaded, setImageLoaded ] = useState( false );
	const { dispatchStoreEvent } = useStoreEvents();

	const typographyProps = useTypographyProps( props );
	const borderProps = useBorderProps( props );
	const spacingProps = useSpacingProps( props );

	if ( ! product.id ) {
		return (
			<div
				className={ classnames(
					className,
					'wc-block-components-product-image',
					{
						[ `${ parentClassName }__product-image` ]: parentClassName,
					},
					borderProps.className
				) }
				style={ {
					...typographyProps.style,
					...borderProps.style,
					...spacingProps.style,
				} }
			>
				<ImagePlaceholder />
			</div>
		);
	}
	const hasProductImages = !! product.images.length;
	const image = hasProductImages ? product.images[ 0 ] : null;
	const ParentComponent = showProductLink ? 'a' : Fragment;
	const anchorLabel = sprintf(
		/* translators: %s is referring to the product name */
		__( 'Link to %s', 'woo-gutenberg-products-block' ),
		product.name
	);
	const anchorProps = {
		href: product.permalink,
		...( ! hasProductImages && { 'aria-label': anchorLabel } ),
		onClick: () => {
			dispatchStoreEvent( 'product-view-link', {
				product,
			} );
		},
	};

	return (
		<div
			className={ classnames(
				className,
				'wc-block-components-product-image',
				{
					[ `${ parentClassName }__product-image` ]: parentClassName,
				},
				borderProps.className
			) }
			style={ {
				...typographyProps.style,
				...borderProps.style,
				...spacingProps.style,
			} }
		>
			<ParentComponent { ...( showProductLink && anchorProps ) }>
				{ !! showSaleBadge && (
					<ProductSaleBadge
						align={ saleBadgeAlign }
						product={ product }
					/>
				) }
				<Image
					fallbackAlt={ product.name }
					image={ image }
					onLoad={ () => setImageLoaded( true ) }
					loaded={ imageLoaded }
					showFullSize={ imageSizing !== 'cropped' }
				/>
			</ParentComponent>
		</div>
	);
};

const ImagePlaceholder = () => {
	return (
		<img src={ PLACEHOLDER_IMG_SRC } alt="" width={ 500 } height={ 500 } />
	);
};

const Image = ( { image, onLoad, loaded, showFullSize, fallbackAlt } ) => {
	const { thumbnail, width, height, src, srcset, sizes, alt } = image || {};
	let width_full = '';
	let width_woocommerce_thumbnail = '';
	let height_full = '';
	let height_woocommerce_thumbnail = '';
	let srcset_full = srcset;
	let srcset_woocommerce_thumbnail = srcset;
	let sizes_full = sizes;
	let sizes_woocommerce_thumbnail = sizes;
	if( width !== undefined && height !== undefined ){
		width_full = width.full;
		width_woocommerce_thumbnail = width.woocommerce_thumbnail;
		height_full = height.full;
		height_woocommerce_thumbnail = height.woocommerce_thumbnail;
	}

	if( typeof srcset === "object" && srcset.hasOwnProperty( 'full' ) && srcset.hasOwnProperty( 'woocommerce_thumbnail' ) ){
		srcset_full = srcset.full;
		srcset_woocommerce_thumbnail = srcset.woocommerce_thumbnail;
	}

	if( typeof sizes === "object" && sizes.hasOwnProperty( 'full' ) && sizes.hasOwnProperty( 'woocommerce_thumbnail' ) ){
		sizes_full = sizes.full;
		sizes_woocommerce_thumbnail = sizes.woocommerce_thumbnail;
	}

	const imageProps = {
		alt: alt || fallbackAlt,
		onLoad,
		hidden: ! loaded,
		src: thumbnail,
		width: width_woocommerce_thumbnail,
		height: height_woocommerce_thumbnail,
		srcSet: srcset_woocommerce_thumbnail,
		sizes: sizes_woocommerce_thumbnail,
		...( showFullSize && { src, width: width_full, height: height_full, srcSet: srcset_full, sizes: sizes_full } ),
	};

	return (
		<>
			{ imageProps.src && (
				/* eslint-disable-next-line jsx-a11y/alt-text */
				<img data-testid="product-image" { ...imageProps } />
			) }
			{ ! loaded && <ImagePlaceholder /> }
		</>
	);
};

Block.propTypes = {
	className: PropTypes.string,
	fallbackAlt: PropTypes.string,
	showProductLink: PropTypes.bool,
	showSaleBadge: PropTypes.bool,
	saleBadgeAlign: PropTypes.string,
};

export default withProductDataContext( Block );
