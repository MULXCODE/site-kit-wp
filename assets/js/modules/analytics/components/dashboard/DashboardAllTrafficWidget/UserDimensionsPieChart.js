/**
 * UserDimensionsPieChart component
 *
 * Site Kit by Google, Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { Fragment, useEffect, useRef, useState } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_SITE } from '../../../../../googlesitekit/datastore/site/constants';
import { CORE_UI } from '../../../../../googlesitekit/datastore/ui/constants';
import {
	UI_DIMENSION_COLOR,
	UI_DIMENSION_VALUE,
	UI_ACTIVE_ROW_INDEX,
} from '../../../datastore/constants';
import { numberFormat, sanitizeHTML, trackEvent } from '../../../../../util';
import { extractAnalyticsDataForPieChart } from '../../../util';
import GoogleChartV2 from '../../../../../components/GoogleChartV2';
import Link from '../../../../../components/Link';
import PreviewBlock from '../../../../../components/PreviewBlock';
const { useDispatch, useSelect } = Data;

export default function UserDimensionsPieChart( {
	dimensionName,
	dimensionValue,
	loaded,
	report,
	sourceLink,
} ) {
	const [ selectable, setSelectable ] = useState( false );

	const otherSupportURL = useSelect( ( select ) => select( CORE_SITE ).getGoogleSupportURL( {
		path: '/analytics/answer/1009671',
	} ) );
	const notSetSupportURL = useSelect( ( select ) => select( CORE_SITE ).getGoogleSupportURL( {
		path: '/analytics/answer/2820717',
	} ) );
	const dimensionColor = useSelect( ( select ) => select( CORE_UI ).getValue( UI_DIMENSION_COLOR ) );
	const activeRowIndex = useSelect( ( select ) => select( CORE_UI ).getValue( UI_ACTIVE_ROW_INDEX ) );

	const { setValues } = useDispatch( CORE_UI );

	const chartWrapperRef = useRef();
	const containerRef = useRef();

	useEffect( () => {
		const onTooltipClick = ( event ) => {
			const { target } = event || {};
			if ( ! target?.classList?.contains( 'googlesitekit-cta-link__tooltip' ) ) {
				return;
			}

			const label = target.dataset.rowLabel;
			if ( label === '(other)' || label === '(not set)' ) {
				trackEvent( 'all_traffic_widget', 'help_click', label );
			} else if ( label === 'others' ) {
				trackEvent( 'all_traffic_widget', 'others_source_click', null );
			}
		};

		if ( containerRef.current ) {
			containerRef.current.addEventListener( 'click', onTooltipClick );
		}

		return () => {
			if ( containerRef.current ) {
				containerRef.current.removeEventListener( 'click', onTooltipClick );
			}
		};
	}, [ containerRef.current ] );

	const absOthers = {
		current: report?.[ 0 ]?.data?.totals?.[ 0 ]?.values?.[ 0 ],
		previous: report?.[ 0 ]?.data?.totals?.[ 1 ]?.values?.[ 0 ],
	};

	( report?.[ 0 ]?.data?.rows || [] ).forEach( ( { metrics } ) => {
		absOthers.current -= metrics[ 0 ].values[ 0 ];
		absOthers.previous -= metrics[ 1 ].values[ 0 ];
	} );

	const getTooltipHelp = ( url, label, rowLabel ) => (
		`<p>
			<a
				href="${ url }"
				class="googlesitekit-cta-link googlesitekit-cta-link--external googlesitekit-cta-link--inherit googlesitekit-cta-link__tooltip"
				target="_blank"
				rel="noreferrer noopener"
				data-row-label="${ rowLabel }"
			>
				${ label }
			</a>
		</p>`
	);

	const dataMap = extractAnalyticsDataForPieChart( report, {
		keyColumnIndex: 0,
		maxSlices: 5,
		withOthers: true,
		tooltipCallback: ( row, rowData ) => {
			let difference = row?.metrics?.[ 1 ]?.values?.[ 0 ] > 0
				? ( row.metrics[ 0 ].values[ 0 ] * 100 / row.metrics[ 1 ].values[ 0 ] ) - 100
				: 100;

			if ( row === null && absOthers.previous > 0 ) {
				difference = ( absOthers.current * 100 / absOthers.previous ) - 100;
			}

			const absValue = row ? row.metrics[ 0 ].values[ 0 ] : absOthers.current;
			const statInfo = sprintf(
				/* translators: 1: numeric value of users, 2: up or down arrow , 3: different change in percentage, %%: percent symbol */
				_x( 'Users: <strong>%1$s</strong> <em>%2$s %3$s%%</em>', 'Stat information for the user dimensions chart tooltip', 'google-site-kit' ),
				numberFormat( absValue ),
				`<svg width="9" height="9" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="${ classnames( 'googlesitekit-change-arrow', {
					'googlesitekit-change-arrow--up': difference > 0,
					'googlesitekit-change-arrow--down': difference < 0,
				} ) }">
					<path d="M5.625 10L5.625 2.375L9.125 5.875L10 5L5 -1.76555e-07L-2.7055e-07 5L0.875 5.875L4.375 2.375L4.375 10L5.625 10Z" fill="currentColor" />
				</svg>`,
				numberFormat( Math.abs( difference ), { maximumFractionDigits: 2 } ),
			);

			const rowLabel = rowData[ 0 ].toLowerCase();
			const dimensionClassName = `googlesitekit-visualization-tooltip-${ rowLabel.replace( /\W+/, '_' ) }`;

			let tooltip = (
				`<p>
					${ /* translators: %s: dimension label */ sprintf( __( '%s:', 'google-site-kit' ), rowData[ 0 ].toUpperCase() ) }
					<b>${ numberFormat( rowData[ 1 ], { maximumFractionDigits: 1, style: 'percent' } ) }</b>
				</p>
				<p>
					${ statInfo }
				</p>`
			);

			const othersLabel = __( 'Others', 'google-site-kit' ).toLowerCase();
			if ( sourceLink && rowLabel === othersLabel ) {
				tooltip += getTooltipHelp(
					sourceLink,
					__( 'See the detailed breakdown in Analytics', 'google-site-kit' ),
					'others'
				);
			}

			if ( otherSupportURL && rowLabel === '(other)' ) {
				tooltip += getTooltipHelp(
					otherSupportURL,
					/* translators: %s: pie slice label */
					sprintf( __( 'Learn more about what "%s" means', 'google-site-kit' ), rowLabel ),
					rowLabel
				);
			}

			if ( notSetSupportURL && rowLabel === '(not set)' ) {
				tooltip += getTooltipHelp(
					notSetSupportURL,
					/* translators: %s: pie slice label */
					sprintf( __( 'Learn more about what "%s" means', 'google-site-kit' ), rowLabel ),
					rowLabel
				);
			}

			tooltip = (
				`<div class="${ classnames( 'googlesitekit-visualization-tooltip', dimensionClassName, {
					'googlesitekit-visualization-tooltip--up': difference > 0,
					'googlesitekit-visualization-tooltip--down': difference < 0,
				} ) }">
					${ tooltip }
				</div>`
			);

			return tooltip;
		},
		hideEmpty: true,
	} );

	const { slices } = UserDimensionsPieChart.chartOptions;

	const onLegendClick = ( index ) => {
		if ( ! chartWrapperRef.current ) {
			return;
		}

		const newDimensionValue = chartWrapperRef.current.getDataTable().getValue( index, 0 );
		const isOthers = __( 'Others', 'google-site-kit' ) === newDimensionValue;

		// Do not do anything as "Others" should not be selectable.
		if ( isOthers ) {
			return;
		}

		const { row } = chartWrapperRef.current.getChart().getSelection()?.[ 0 ] || {};
		if ( row === index ) {
			setValues( {
				[ UI_DIMENSION_VALUE ]: '',
				[ UI_DIMENSION_COLOR ]: '',
				[ UI_ACTIVE_ROW_INDEX ]: null,
			} );
		} else if ( newDimensionValue ) {
			setValues( {
				[ UI_DIMENSION_COLOR ]: slices[ row ]?.color,
				[ UI_DIMENSION_VALUE ]: newDimensionValue,
				[ UI_ACTIVE_ROW_INDEX ]: index,
			} );

			trackEvent(
				'all_traffic_widget',
				'slice_select',
				`${ dimensionName }:${ newDimensionValue }`,
			);
		}
	};

	const onMouseOut = () => {
		setSelectable( false );
	};

	const onMouseOver = ( event, { chartWrapper } ) => {
		const { row } = event;

		if ( row === undefined || row === null ) {
			setSelectable( false );
		}

		const dataTable = chartWrapper.getDataTable();
		setSelectable( dataTable.getValue( row, 0 ) !== __( 'Others', 'google-site-kit' ) );
	};

	const onSelect = ( { chartWrapper } ) => {
		const chart = chartWrapper.getChart();
		const { row } = chart.getSelection()?.[ 0 ] || {};

		if ( row === null || row === undefined ) {
			setValues( {
				[ UI_DIMENSION_VALUE ]: '',
				[ UI_DIMENSION_COLOR ]: '',
				[ UI_ACTIVE_ROW_INDEX ]: null,
			} );
		} else {
			const dataTable = chartWrapper.getDataTable();
			if ( dataTable ) {
				const newDimensionValue = dataTable.getValue( row, 0 );
				const isOthers = __( 'Others', 'google-site-kit' ) === newDimensionValue;

				if ( isOthers ) {
					// Maintain the existing selection when clicking on the "Others" slice.
					// We set a value here because otherwise Google Charts will show the
					// "Others" slice as selected.
					if ( activeRowIndex === null || activeRowIndex === undefined ) {
						chart.setSelection( [] );
					} else {
						chart.setSelection( [ { row: activeRowIndex } ] );
					}
				} else {
					setValues( {
						[ UI_DIMENSION_COLOR ]: slices[ row ]?.color,
						[ UI_DIMENSION_VALUE ]: newDimensionValue,
						[ UI_ACTIVE_ROW_INDEX ]: row,
					} );

					trackEvent(
						'all_traffic_widget',
						'slice_select',
						`${ dimensionName }:${ newDimensionValue }`,
					);
				}
			}
		}
	};

	const onReady = ( { chartWrapper } ) => {
		const chart = chartWrapper.getChart();

		// If there is a dimension value set but the initialized chart does not have a
		// selection yet, find the matching row index and initially select it in the chart.
		if ( dimensionValue && ! chart.getSelection().length ) {
			// Look in the real data map, which includes headings, therefore subtract 1.
			const selectedRow = dataMap.findIndex( ( row ) => row[ 0 ] === dimensionValue ) - 1;

			if ( selectedRow >= 0 ) {
				// If the new data includes the original dimension value, re-select it and adjust the color as needed.
				chart.setSelection( [ { row: selectedRow } ] );
				if (
					activeRowIndex !== selectedRow ||
					( slices[ selectedRow ]?.color || dimensionColor ) !== dimensionColor
				) {
					setValues( {
						[ UI_ACTIVE_ROW_INDEX ]: selectedRow,
						[ UI_DIMENSION_COLOR ]: slices[ selectedRow ]?.color || dimensionColor,
					} );
				}
			} else {
				// If the new data does not include the original dimension value, unset it to match the empty selection.
				setValues( {
					[ UI_DIMENSION_VALUE ]: '',
					[ UI_DIMENSION_COLOR ]: '',
					[ UI_ACTIVE_ROW_INDEX ]: null,
				} );
			}
		}

		// If there is no dimension value set but the initialized chart does have a selection,
		// ensure it is no longer selected in the chart.
		if ( ! dimensionValue && chart.getSelection().length ) {
			chart.setSelection( [] );
			if ( activeRowIndex !== null ) {
				setValues( {
					[ UI_ACTIVE_ROW_INDEX ]: null,
				} );
			}
		}

		// If no dimensionValue is set, unset the color.
		if ( ! dimensionValue && dimensionColor !== '' ) {
			setValues( {
				[ UI_DIMENSION_COLOR ]: '',
			} );
		}
	};

	const labels = {
		'ga:channelGrouping': __( '<span>By</span> channels', 'google-site-kit' ),
		'ga:country': __( '<span>By</span> locations', 'google-site-kit' ),
		'ga:deviceCategory': __( '<span>By</span> devices', 'google-site-kit' ),
	};

	const sanitizeArgs = {
		ALLOWED_TAGS: [ 'span' ],
		ALLOWED_ATTR: [],
	};

	const title = loaded
		? sanitizeHTML( labels[ dimensionName ] || '', sanitizeArgs )
		: { __html: '' };

	const options = { ...UserDimensionsPieChart.chartOptions };
	if ( report?.[ 0 ]?.data?.rows?.length < 2 ) {
		// Hide pie slice text when there is just one slice because it will overlap with the chart title.
		options.pieSliceTextStyle.color = 'transparent';
	}

	if ( dimensionValue?.length ) {
		options.tooltip.trigger = 'selection';
	} else {
		options.tooltip.trigger = 'focus';
	}

	return (
		<div className="googlesitekit-widget--analyticsAllTraffic__dimensions-container">
			<div ref={ containerRef } className={ classnames(
				'googlesitekit-widget--analyticsAllTraffic__dimensions-chart',
				{
					'googlesitekit-widget--analyticsAllTraffic__slice-selected': !! dimensionValue,
					'googlesitekit-widget--analyticsAllTraffic__selectable': selectable,
				}
			) }>
				{ /* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */ }
				<GoogleChartV2
					chartType="PieChart"
					data={ dataMap || [] }
					getChartWrapper={ ( chartWrapper ) => {
						chartWrapperRef.current = chartWrapper;
					} }
					height="368px"
					loaded={ loaded }
					loadingHeight="300px"
					loadingWidth="300px"
					onMouseOut={ onMouseOut }
					onMouseOver={ onMouseOver }
					onReady={ onReady }
					onSelect={ onSelect }
					options={ options }
					width="100%"
				>
					<div
						className="googlesitekit-widget--analyticsAllTraffic__dimensions-chart-title"
						dangerouslySetInnerHTML={ title }
					/>
				</GoogleChartV2>

				<div className="googlesitekit-widget--analyticsAllTraffic__legend">
					{ loaded && dataMap?.slice( 1 ).map( ( [ label ], i ) => {
						const isActive = label === dimensionValue;
						const sliceColor = slices[ i ]?.color;
						const isOthers = __( 'Others', 'google-site-kit' ) === label;

						return (
							<Link
								key={ label }
								onClick={ () => onLegendClick( i ) }
								className={ classnames(
									'googlesitekit-widget--analyticsAllTraffic__legend-slice',
									{
										'googlesitekit-widget--analyticsAllTraffic__legend-active': isActive,
										'googlesitekit-widget--analyticsAllTraffic__legend-others': isOthers,
									}
								) }
							>
								<span className="googlesitekit-widget--analyticsAllTraffic__dot" style={ { backgroundColor: sliceColor } } />

								<span className="googlesitekit-widget--analyticsAllTraffic__label" data-label={ label }>
									{ label }
								</span>

								<span className="googlesitekit-widget--analyticsAllTraffic__underlay" style={ { backgroundColor: sliceColor } } />
							</Link>
						);
					} ) }

					{ ! loaded && (
						<Fragment>
							<div className="googlesitekit-widget--analyticsAllTraffic__legend-slice">
								<span className="googlesitekit-widget--analyticsAllTraffic__dot" style={ { backgroundColor: '#ccc' } } />
								<PreviewBlock height="18px" width="68px" shape="square" />
							</div>

							<div className="googlesitekit-widget--analyticsAllTraffic__legend-slice">
								<span className="googlesitekit-widget--analyticsAllTraffic__dot" style={ { backgroundColor: '#ccc' } } />
								<PreviewBlock height="18px" width="52px" shape="square" />
							</div>

							<div className="googlesitekit-widget--analyticsAllTraffic__legend-slice">
								<span className="googlesitekit-widget--analyticsAllTraffic__dot" style={ { backgroundColor: '#ccc' } } />
								<PreviewBlock height="18px" width="40px" shape="square" />
							</div>

							<div className="googlesitekit-widget--analyticsAllTraffic__legend-slice">
								<span className="googlesitekit-widget--analyticsAllTraffic__dot" style={ { backgroundColor: '#ccc' } } />
								<PreviewBlock height="18px" width="52px" shape="square" />
							</div>
						</Fragment>
					) }
				</div>
			</div>
		</div>
	);
}

UserDimensionsPieChart.defaultProps = {
	dimensionName: 'ga:channelGrouping',
};

UserDimensionsPieChart.chartOptions = {
	chartArea: {
		left: 'auto',
		height: 300,
		top: 'auto',
		width: '100%',
	},
	backgroundColor: 'transparent',
	fontSize: 12,
	height: 368,
	legend: {
		position: 'none',
	},
	pieHole: 0.6,
	pieSliceTextStyle: {
		color: 'black',
		fontSize: 12,
	},
	slices: {
		0: { color: '#ffcd33' },
		1: { color: '#c196ff' },
		2: { color: '#9de3fe' },
		3: { color: '#ff7fc6' },
		4: { color: '#ff886b' },
	},
	title: null,
	tooltip: {
		isHtml: true, // eslint-disable-line sitekit/acronym-case
		trigger: 'focus',
	},
	width: '100%',
};

UserDimensionsPieChart.propTypes = {
	sourceLink: PropTypes.string,
	dimensionName: PropTypes.string.isRequired,
	dimensionValue: PropTypes.string,
	report: PropTypes.arrayOf( PropTypes.object ),
	loaded: PropTypes.bool,
};
