/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { Fragment, useMemo, useState } from '@wordpress/element';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Component used to show a list of checkboxes in a group.
 *
 * @param {Object} props Incoming props for the component.
 * @param {string} props.className CSS class used.
 * @param {function(string):any} props.onChange Function called when inputs change.
 * @param {Array} props.options Options for list.
 * @param {Array} props.checked Which items are checked.
 * @param {boolean} props.isLoading If loading or not.
 * @param {boolean} props.isDisabled If inputs are disabled or not.
 * @param {number} props.limit Whether to limit the number of inputs showing.
 */
const CheckboxListHierarchical = ( {
	className,
	onChange = () => {},
	options = [],
	topParent = 0,
	checked = [],
	isLoading = false,
	isDisabled = false,
	limit = 10,
} ) => {

	const placeholder = useMemo( () => {
		return [ ...Array( 5 ) ].map( ( x, i ) => (
			<li
				key={ i }
				style={ {
					/* stylelint-disable */
					width: Math.floor( Math.random() * 75 ) + 25 + '%',
				} }
			/>
		) );
	}, [] );

	const childList = (currentOptions, depth = 0) => {

		return (
			<>
				{ currentOptions.map( ( option, index ) => {
					const children = options.filter(o => Number(o.parent) === Number(option.value));
					return <Fragment key={ option.value }>
						<li	className='wc-block-checkbox-list__li'>
							<div className='wc-block-checkbox-list__item'>
								<input
										className='wc-block-checkbox-list__checkbox'
										type="checkbox"
										id={ option.value }
										value={ option.value }
										onChange={ ( event ) => {
											onChange( event.target.value );
										} }
										checked={ checked.includes( option.value ) }
										disabled={ isDisabled }
									/>
								<label className='wc-block-checkbox-list__label'
									htmlFor={ option.value }>
									{ option.label }
								</label>
							</div>
							{children.length > 0 && option.open && <ul className='wc-block-checkbox-list__sublist'>{childList(children, ++depth)}</ul>}
						</li>
					</Fragment>
				} ) }
			</>
		);
	}

	const renderedOptions = useMemo(
		() => childList(options.filter(o => Number(o.parent) === topParent)),
		[
			options,
			topParent,
			onChange,
			checked,
			limit,
			isDisabled,
		]
	);

	const classes = classNames(
		'wc-block-checkbox-list',
		'wc-block-components-checkbox-list',
		{
			'is-loading': isLoading,
		},
		className
	);

	return (
		<ul className={ classes }>
			{ isLoading ? placeholder : renderedOptions }
		</ul>
	);
};

CheckboxListHierarchical.propTypes = {
	onChange: PropTypes.func,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.node.isRequired,
			value: PropTypes.string.isRequired,
		} )
	),
	topParent: PropTypes.number,
	checked: PropTypes.array,
	className: PropTypes.string,
	isLoading: PropTypes.bool,
	isDisabled: PropTypes.bool,
	limit: PropTypes.number,
};

export default CheckboxListHierarchical;
