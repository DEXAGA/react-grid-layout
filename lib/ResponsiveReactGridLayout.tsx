// @flow
import * as React from "react";
// @ts-ignore
import isEqual from "lodash.isequal";

import {cloneLayout, synchronizeLayoutWithChildren,} from "./utils";
import {findOrGenerateResponsiveLayout, getBreakpointFromWidth,} from "./responsiveUtils";
import ReactGridLayout from "./ReactGridLayout";
import useSize from "./components/useSize";

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

const ResponsiveReactGridLayout = (props) => {

  const generateInitialState = () => {
    let compactType = props.compactType;
    const breakpoint = getBreakpointFromWidth(props.breakpoints, props.width);
    // verticalCompact compatibility, now deprecated
    compactType = props.verticalCompact === false ? null : compactType;
    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    return {
      layout: findOrGenerateResponsiveLayout(
              props.layouts,
              props.breakpoints,
              breakpoint,
              breakpoint,
              props.cols[breakpoint],
              compactType
      ),
      breakpoint: breakpoint,
      cols: props.cols[breakpoint]
    };
  }

  const [state, setState] = React.useState({
    ...generateInitialState()
  })

  const parentRef = React.useRef();
  const {width, height} = useSize(parentRef)

  React.useEffect(() => {
    return setState(prevState => {
      if (!isEqual(props.layouts, prevState.layouts)) {

        const newLayout = findOrGenerateResponsiveLayout(
                props.layouts,
                props.breakpoints,
                prevState.breakpoint,
                prevState.breakpoint,
                prevState.cols,
                props.compactType
        );
        return ({
          ...prevState,
          layout: newLayout,
          layouts: props.layouts
        });
      } else {
        return (
                prevState
        )
      }
    })
  })

  React.useEffect(() => {
    if (
            props.width != props.width ||
            props.breakpoint !== props.breakpoint ||
            !isEqual(props.breakpoints, props.breakpoints) ||
            !isEqual(props.cols, props.cols)
    ) {
      onWidthChange(props);
    }
  })

  // wrap layouts so we do not need to pass layouts to child
  const onLayoutChange = (layout: any) => {
    props.onLayoutChange(layout, {
      ...props.layouts,
      [state.breakpoint]: layout
    });
  };

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  const onWidthChange = (prevProps: Readonly<any>) => {
    const newBreakpoint =
            props.breakpoint || getBreakpointFromWidth(props.breakpoints, props.width);

    const lastBreakpoint = state.breakpoint;
    const newCols: number = (props.cols)[newBreakpoint];
    const newLayouts = {...(props.layouts)};

    // Breakpoint change
    if (
            lastBreakpoint !== newBreakpoint ||
            prevProps.breakpoints !== props.breakpoints ||
            prevProps.cols !== props.cols
    ) {
      // Preserve the current layout if the current breakpoint is not present in the next layouts.
      if (!(lastBreakpoint in newLayouts))
        newLayouts[lastBreakpoint] = cloneLayout(state.layout);

      // Find or generate a new layout.
      let layout = findOrGenerateResponsiveLayout(
              newLayouts,
              props.breakpoints,
              newBreakpoint,
              lastBreakpoint,
              newCols,
              props.compactType
      );

      // This adds missing items.
      layout = synchronizeLayoutWithChildren(
              layout,
              props.children,
              newCols,
              props.compactType
      );

      // Store the new layout.
      newLayouts[newBreakpoint] = layout;

      // callbacks
      props.onLayoutChange(layout, newLayouts);
      props.onBreakpointChange(newBreakpoint, newCols);

      setState(prevState => ({
        ...prevState,
        breakpoint: newBreakpoint,
        layout: layout,
        cols: newCols
      }));
    }

    const margin = getIndentationValue(props.margin, newBreakpoint);
    const containerPadding = getIndentationValue(
            props.containerPadding,
            newBreakpoint
    );

    //call onWidthChange on every change of width, not only on breakpoint changes
    props.onWidthChange(
            props.width,
            margin,
            newCols,
            containerPadding
    );
  }

  return (
          <div ref={parentRef}
               style={{
                 height: `100%`
               }}>
            <ReactGridLayout
                    autoSize={props.autoSize}
                    children={props.children}
                    compactType={props.compactType}
                    innerRef={props.innerRef}
                    onDrop={props.onDrop}
                    preventCollision={props.preventCollision}
                    width={width}
                    height={height}
                    margin={getIndentationValue(props.margin, state.breakpoint)}
                    containerPadding={getIndentationValue(props.containerPadding, state.breakpoint)}
                    rowHeight={height / 12 - props.margin[1] / 12 - props.containerPadding[1] / 12}
                    useCSSTransforms={props.useCSSTransforms}
                    onLayoutChange={onLayoutChange}
                    layout={state.layout}
                    cols={state.cols}
            />
          </div>
  );
}

ResponsiveReactGridLayout.defaultProps = {
  breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
  cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
  containerPadding: [10, 10],
  layouts: {},
  margin: [10, 10],
  onBreakpointChange: () => {
  },
  onLayoutChange: () => {
  },
  onWidthChange: () => {
  }
};

export default ResponsiveReactGridLayout
