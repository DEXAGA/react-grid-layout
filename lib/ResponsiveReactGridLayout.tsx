// @flow
import * as React from "react";
import PropTypes from "prop-types";
// @ts-ignore
import isEqual from "lodash.isequal";

import {cloneLayout, Layout, noop, synchronizeLayoutWithChildren, validateLayout,} from "./utils";
import {findOrGenerateResponsiveLayout, getBreakpointFromWidth, getColsFromBreakpoint,} from "./responsiveUtils";
import ReactGridLayout from "./ReactGridLayout";

const type = (obj: any) => Object.prototype.toString.call(obj);

/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */
function getIndentationValue(
        param: { [x: string]: any; } | null,
        breakpoint: string
) {
  // $FlowIgnore TODO fix this typedef
  if (param == null) return null;
  // $FlowIgnore TODO fix this typedef
  return Array.isArray(param) ? param : param[breakpoint];
}

export default class ResponsiveReactGridLayout extends React.Component {
  // This should only include propTypes needed in this code; RGL itself
  // will do validation of the rest props passed to it.
  static propTypes = {
    //
    // Basic props
    //

    // Optional, but if you are managing width yourself you may want to set the breakpoint
    // yourself as well.
    breakpoint: PropTypes.string,

    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: PropTypes.object,

    // # of cols. This is a breakpoint -> cols map
    cols: PropTypes.object,

    // # of margin. This is a breakpoint -> margin map
    // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
    // Margin between items [x, y] in px
    // e.g. [10, 10]
    margin: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    // # of containerPadding. This is a breakpoint -> containerPadding map
    // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
    // Padding inside the container [x, y] in px
    // e.g. [10, 10]
    containerPadding: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    // layouts is an object mapping breakpoints to layouts.
    // e.g. {lg: Layout, md: Layout, ...}
    layouts(props: { [x: string]: {}; breakpoints: any; layouts: { [x: string]: Layout; }; } , propName: string) {
      if (type(props[propName]) !== "[object Object]") {
        throw new Error(
          "Layout property must be an object. Received: " +
            type(props[propName])
        );
      }
      Object.keys(props[propName]).forEach(key => {
        if (!(key in props.breakpoints)) {
          throw new Error(
            "Each key in layouts must align with a key in breakpoints."
          );
        }
        validateLayout(props.layouts[key], "layouts." + key);
      });
    },

    // The width of this component.
    // Required in this propTypes stanza because generateInitialState() will fail without it.
    width: PropTypes.number.isRequired,

    //
    // Callbacks
    //

    // Calls back with breakpoint and new # cols
    onBreakpointChange: PropTypes.func,

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: PropTypes.func,

    // Calls back with (containerWidth, margin, cols, containerPadding)
    onWidthChange: PropTypes.func
  };

  static defaultProps  = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    containerPadding: [10, 10],
    layouts: {},
    margin: [10, 10],
    onBreakpointChange: noop,
    onLayoutChange: noop,
    onWidthChange: noop
  };

  state  = this.generateInitialState();

  generateInitialState()  {
    let { width, breakpoints, layouts, cols,verticalCompact,compactType }: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    const breakpoint = getBreakpointFromWidth(breakpoints, width);
    const colNo = getColsFromBreakpoint(breakpoint, cols);
    // verticalCompact compatibility, now deprecated
      compactType = verticalCompact === false ? null :  compactType;
    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    const initialLayout = findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      breakpoint,
      colNo,
      compactType
    );

    return {
      layout: initialLayout,
      breakpoint: breakpoint,
      cols: colNo
    };
  }

  static getDerivedStateFromProps(
    nextProps: { layouts: { [x: string]: any; }; breakpoints: { [x: string]: number; }; compactType: any; },
    prevState: { layouts?: any; breakpoint?: any; cols?: any; }
  )  {
    if (!isEqual(nextProps.layouts, prevState.layouts)) {
      // Allow parent to set layouts directly.
      const { breakpoint, cols } = prevState;

      // Since we're setting an entirely new layout object, we must generate a new responsive layout
      // if one does not exist.
      const newLayout = findOrGenerateResponsiveLayout(
        nextProps.layouts,
        nextProps.breakpoints,
        breakpoint,
        breakpoint,
        cols,
        nextProps.compactType
      );
      return { layout: newLayout, layouts: nextProps.layouts };
    }

    return null;
  }

  componentDidUpdate(prevProps: Readonly<any>) {
    // Allow parent to set width or breakpoint directly.
    const {breakpoint, breakpoints, cols, width}: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    if (
      width != prevProps.width ||
      breakpoint !== prevProps.breakpoint ||
      !isEqual(breakpoints, prevProps.breakpoints) ||
      !isEqual(cols, prevProps.cols)
    ) {
      this.onWidthChange(prevProps);
    }
  }

  // wrap layouts so we do not need to pass layouts to child
  onLayoutChange = (layout: any ) => {
    const {layouts, onLayoutChange: onLayoutChange1}: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    onLayoutChange1(layout, {
      ...layouts,
      [this.state.breakpoint]: layout
    });
  };

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(prevProps: Readonly<any> ) {
    const { breakpoints, cols, layouts, compactType }: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    const {
      margin: margin1,
      width,
      onBreakpointChange,
      onLayoutChange: onLayoutChange1,
      breakpoint,
      containerPadding: containerPadding1,
      onWidthChange: onWidthChange1,
      breakpoints: breakpoints1,
      children
    }: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    const newBreakpoint =
      breakpoint || getBreakpointFromWidth(breakpoints1, width);

    const lastBreakpoint = this.state.breakpoint;
    const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);
    const newLayouts = { ...layouts };

    // Breakpoint change
    if (
      lastBreakpoint !== newBreakpoint ||
      prevProps.breakpoints !== breakpoints ||
      prevProps.cols !== cols
    ) {
      // Preserve the current layout if the current breakpoint is not present in the next layouts.
      if (!(lastBreakpoint in newLayouts))
        newLayouts[lastBreakpoint] = cloneLayout(this.state.layout);

      // Find or generate a new layout.
      let layout = findOrGenerateResponsiveLayout(
        newLayouts,
        breakpoints,
        newBreakpoint,
        lastBreakpoint,
        newCols,
        compactType
      );

      // This adds missing items.
      layout = synchronizeLayoutWithChildren(
        layout,
        children,
        newCols,
        compactType
      );

      // Store the new layout.
      newLayouts[newBreakpoint] = layout;

      // callbacks
      onLayoutChange1(layout, newLayouts);
      onBreakpointChange(newBreakpoint, newCols);

      this.setState({
        breakpoint: newBreakpoint,
        layout: layout,
        cols: newCols
      });
    }

    const margin = getIndentationValue(margin1, newBreakpoint);
    const containerPadding = getIndentationValue(
      containerPadding1,
      newBreakpoint
    );

    //call onWidthChange on every change of width, not only on breakpoint changes
    onWidthChange1(
      width,
      margin,
      newCols,
      containerPadding
    );
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      breakpoint,
      breakpoints,
      cols,
      layouts,
      margin,
      containerPadding,
      onBreakpointChange,
      onLayoutChange,
      onWidthChange,
      ...other
    }: Readonly<any> & Readonly<{ children?: React.ReactNode }> = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <ReactGridLayout
        {...other}
        // $FlowIgnore should allow nullable here due to DefaultProps
        margin={getIndentationValue(margin, this.state.breakpoint)}
        containerPadding={getIndentationValue(
          containerPadding,
          this.state.breakpoint
        )}
        onLayoutChange={this.onLayoutChange}
        layout={this.state.layout}
        cols={this.state.cols}
      />
    );
  }
}
