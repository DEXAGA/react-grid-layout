// @flow
import * as React from "react";
// @ts-ignore
import isEqual from "lodash.isequal";

import {synchronizeLayoutWithChildren,} from "./utils";
import {findOrGenerateResponsiveLayout,} from "./responsiveUtils";
import ReactGridLayout from "./ReactGridLayout";
import useSize from "./components/useSize";
import classNames from "classnames";


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

const layoutClassName = "react-grid-layout";

const ResponsiveReactGridLayout = (props) => {

  const parentRef = React.useRef();
  const [{width, height}] = useSize(parentRef)

  const sorted = Object.keys(props.breakpoints).sort(function (a, b) {
    return props.breakpoints[a] - props.breakpoints[b];
  });
  let matching = sorted[0];
  for (let i = 1, len = sorted.length; i < len; i++) {
    if (width > props.breakpoints[sorted[i]]) {
      matching = sorted[i];
    }
  }
  const breakpoint = matching
  const [state, setState] = React.useState({
    layout: findOrGenerateResponsiveLayout(
            props.layouts,
            props.breakpoints,
            breakpoint,
            breakpoint,
            props.cols[breakpoint],
            props.verticalCompact === false ? null : props.compactType
    ),
    breakpoint: breakpoint,
    cols: props.cols[breakpoint]
  })


  React.useEffect(() => {
    return setState(prevState => {

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
          // layouts: props.layouts
        });
    })
  }, [props.breakpoints, props.compactType, props.layouts])

  React.useEffect(() => {
      const newBreakpoint = props.breakpoint || breakpoint;

      const lastBreakpoint = state.breakpoint;
      const newCols: number = (props.cols)[newBreakpoint];
      const newLayouts = {...(props.layouts)};

      // Breakpoint change
      if (
              lastBreakpoint !== newBreakpoint
      ) {
        // Preserve the current layout if the current breakpoint is not present in the next layouts.
        if (!(lastBreakpoint in newLayouts))
          newLayouts[lastBreakpoint] = state.layout;

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


        ////////////// BREAKPOINT CHANGE ISSUE HERE



        // layout = synchronizeLayoutWithChildren(
        //         layout,
        //         props.children,
        //         newCols,
        //         props.compactType
        // );
        //
        // // Store the new layout.
        // newLayouts[newBreakpoint] = layout;

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
              width,
              margin,
              newCols,
              containerPadding
      );
  }, [breakpoint, props, props.breakpoints, props.cols, state.breakpoint, state.layout, width])

  // wrap layouts so we do not need to pass layouts to child
  const onLayoutChange = (layout: any) => {
    props.onLayoutChange(layout, {
      ...props.layouts,
      [state.breakpoint]: layout
    });
  };

  return (
          <div ref={parentRef}
               style={{
                 height: `100%`,
                 width: `100%`
               }}>
            {/*<div>*/}
              {/*{JSON.stringify(props.layouts)}*/}
              {/*<br/>*/}
              {/*{JSON.stringify(props.breakpoints)}*/}
              {/*<br/>*/}
              {/*{JSON.stringify(props.cols)}*/}
              {/*{JSON.stringify(state.layout)}*/}
            {/*</div>*/}
            {(height && width) &&(
            <ReactGridLayout
                    {...props}
                    className={classNames(layoutClassName, props.className)}
                    autoSize={props.autoSize}
                    children={props.children}
                    compactType={props.compactType}
                    // innerRef={props.innerRef}
                    innerRef={parentRef}
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
            )}
          </div>
  );
}

ResponsiveReactGridLayout.defaultProps = {
  breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
  cols: {lg: 12, md: 10, sm: 6, xs: 1, xxs: 1},
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
