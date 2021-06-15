<?php

namespace Automattic\WooCommerce\Blocks\BlockTypes;

/**
 * AttributeFilter class.
 */
class CategoryFilter extends AbstractBlock
{
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'category-filter';

	/**
	 * Extra data passed through from server to client for block.
	 *
	 * @param  array  $categories  Any stock statuses that currently are available from the block.
	 *                           Note, this will be empty in the editor context when the block is
	 *                           not in the post content on editor load.
	 */
	protected function enqueue_data(array $categories = [])
	{
		// since wordpress 4.5.0
		$args                     = array(
			'taxonomy'   => "product_cat",
			'hierarchical' => true,
//			'orderby'    => $orderby,
//			'order'      => $order,
			'hide_empty' => false,
			'fields'     => 'all',
		);
		$product_categories       = get_terms($args);
		$product_categories_assoc = [];
		foreach ($product_categories as $product_category) {
			$product_categories_assoc[$product_category->term_id] = [
				'name'   => $product_category->name,
				'parent' => $product_category->parent,
				'childes' => $this->get_child_nodes( $product_category->term_id, $product_categories ),
				'count'  => $product_category->count
			];
		}
		parent::enqueue_data($categories);
		$this->asset_data_registry->add('categoryOptions', $product_categories_assoc, true);
	}

	function get_child_nodes( $parent_id, $terms ){
		$child_nodes = [];
		if( $parent_id === 0 ){
			return [];
		}
		foreach ( $terms as $product_category ){
			if( $product_category->parent === $parent_id ){
				$child_nodes[] = $product_category->term_id;
			}
		}
		return $child_nodes;
	}
}
