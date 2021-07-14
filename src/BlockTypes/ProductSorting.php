<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes;

/**
 * ProductSorting class.
 */
class ProductSorting extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-sorting';

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param array $stock_statuses  Any stock statuses that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
//	protected function enqueue_data( array $stock_statuses = [] ) {
//		parent::enqueue_data( $stock_statuses );
//		$this->asset_data_registry->add( 'stockStatusOptions', wc_get_product_stock_status_options(), true );
//	}
}
