<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes;

/**
 * AllProducts class.
 */
class AllProducts extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'all-products';

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param array $attributes  Any attributes that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
	protected function enqueue_data( array $attributes = [] ) {
		parent::enqueue_data( $attributes );
		//if archive page set term id to filter product list
		$term_id = "";
		if( isset( get_queried_object()->term_id ) ){
			$term_id = get_queried_object()->term_id;
		}

		$this->asset_data_registry->add( 'min_columns', wc_get_theme_support( 'product_blocks::min_columns', 1 ), true );
		$this->asset_data_registry->add( 'max_columns', wc_get_theme_support( 'product_blocks::max_columns', 6 ), true );
		$this->asset_data_registry->add( 'default_columns', wc_get_theme_support( 'product_blocks::default_columns', 3 ), true );
		$this->asset_data_registry->add( 'min_rows', wc_get_theme_support( 'product_blocks::min_rows', 1 ), true );
		$this->asset_data_registry->add( 'max_rows', wc_get_theme_support( 'product_blocks::max_rows', 6 ), true );
		$this->asset_data_registry->add( 'default_rows', wc_get_theme_support( 'product_blocks::default_rows', 3 ), true );
<<<<<<< HEAD
=======
		$this->asset_data_registry->add( 'hideOutOfStockItems', 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ), true );
		$this->asset_data_registry->add( 'archiveTaxonomyId',  $term_id, true );
>>>>>>> develop
	}
}
